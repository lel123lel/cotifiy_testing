import { Form, Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AnnouncementPage, { type Announcement } from '../announcementpage';

type UpcomingEvent = {
    id: number;
    title: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    capacity?: number;
};

type DiscussionMessage = {
    id: number;
    parent_message_id: number | null;
    author: string;
    role: 'Client' | 'Admin' | 'Staff';
    content: string;
    sent_at: string | null;
};

type Discussion = {
    id: number;
    announcement_id: number;
    announcement_title: string;
    client_name: string;
    messages: DiscussionMessage[];
};

type AnnouncementComment = {
    announcement_id: number;
    messages: DiscussionMessage[];
};

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export default function admin({
    recentAnnouncements,
    upcomingEvents,
    discussions,
    announcementComments,
    announcementCount,
    eventCount,
    userCount,
    adminId,
}: {
    recentAnnouncements: Announcement[];
    upcomingEvents: UpcomingEvent[];
    discussions: Discussion[];
    announcementComments: AnnouncementComment[];
    announcementCount: number;
    eventCount: number;
    userCount: number;
    adminId: number;
}) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [announcementTab, setAnnouncementTab] = useState<'All' | 'My Posts'>('All');

    const visibleAnnouncements = announcementTab === 'All'
        ? recentAnnouncements
        : recentAnnouncements.filter((announcement) => announcement.author_admin_id === adminId);

    // Polling for new discussions if needed
    useEffect(() => {
        const interval = window.setInterval(() => {
            router.reload({ only: ['discussions'] });
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

    // Navigation Links
    const navLinks = [
        { href: '#dashboard', label: 'Dashboard', icon: 'fa-solid fa-house', active: true },
        { href: '/admin/announcements', label: 'Announcements', icon: 'fa-solid fa-bullhorn', active: false },
        { href: '/admin/events', label: 'Events', icon: 'fa-regular fa-calendar', active: false },
        { href: '/admin/users', label: 'Students', icon: 'fa-solid fa-users', active: false },
        { href: '/admin/staff', label: 'Staff & Admins', icon: 'fa-solid fa-user-shield', active: false },
        { href: '/admin/settings', label: 'Settings', icon: 'fa-solid fa-gear', active: false },
    ];

    return (
        <>
            <Head title="Admin Dashboard | Cotify" />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes move-around-1 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(-15vw, 10vh) rotate(15deg); }
                    50% { transform: translate(-5vw, 25vh) rotate(-10deg); }
                    75% { transform: translate(10vw, 15vh) rotate(5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes move-around-2 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(10vw, -15vh) rotate(-20deg); }
                    50% { transform: translate(-20vw, -10vh) rotate(10deg); }
                    75% { transform: translate(-10vw, 15vh) rotate(-5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes move-around-3 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    33% { transform: translate(15vw, -20vh) rotate(45deg) scale(1.2); }
                    66% { transform: translate(-15vw, 10vh) rotate(90deg) scale(0.8); }
                    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                }

                .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }

                /* Fix: hide horizontal overflow on mobile */
                @media (max-width: 767px) {
                    .mobile-scroll-x {
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: thin;
                    }
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">

                {/* MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[2px] border-blue-500/10 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[3px] border-indigo-500/10 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-500/15 rounded-full shape-move-3"></div>
                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/5 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[3px] border-indigo-500/10 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>
                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-indigo-500/5 clip-octagon shape-move-3"></div>
                    <div className="absolute top-[70%] right-[10%] w-28 h-28 border-[2px] border-blue-500/10 rotate-45 shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[40%] w-16 h-16 bg-indigo-500/5 rotate-12 shape-move-3"></div>
                </div>

                {/* COLLAPSIBLE SIDEBAR */}
                <aside
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 ease-in-out shadow-2xl
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    w-64 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
                >
                    <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">

                        {/* Logo Section */}
                        <div className="px-4 flex items-center h-20 mb-4">
                            <Link href="/admin" className="flex items-center shrink-0">
                                <img 
                                    src="/images/3rdLogo.png" 
                                    alt="Cotify Logo" 
                                    className="w-20 h-20 sm:w-12 sm:h-12 object-contain -ml-2 sm:-ml-1 shrink-0 transition-all duration-300" 
                                />
                                <div className={`text-white whitespace-nowrap transition-opacity duration-300 ml-2 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    <h1 className="font-extrabold text-xl leading-tight tracking-tight">Cotify</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                                </div>
                            </Link>
                        </div>

                        {/* Main Navigation Links */}
                        <nav className="space-y-1 px-3">
                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                Main
                            </p>
                            {navLinks.slice(0, 3).map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group ${
                                        link.active
                                            ? 'bg-ctu-lightblue text-white shadow-md'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                    title={!isSidebarExpanded ? link.label : undefined}
                                >
                                    <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                        {link.label}
                                    </span>
                                </a>
                            ))}

                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                People
                            </p>
                            {navLinks.slice(3, 5).map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    title={!isSidebarExpanded ? link.label : undefined}
                                >
                                    <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}

                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                System
                            </p>
                            {navLinks.slice(5).map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    title={!isSidebarExpanded ? link.label : undefined}
                                >
                                    <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="p-3">
                        <div className="flex items-center gap-4 px-3 py-3 mb-1 rounded-xl border border-transparent">
                            <div className="w-10 h-10 rounded-full bg-ctu-lightblue flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-transparent">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                <p className="text-white text-[15px] font-extrabold truncate">Admin</p>
                                <p className="text-slate-400 text-xs font-semibold truncate">Registrar's Office</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsLogoutModalOpen(true)}
                            onMouseEnter={() => setIsLogoutHovered(true)}
                            onMouseLeave={() => setIsLogoutHovered(false)}
                            className={`flex w-full items-center gap-4 px-3 py-3.5 text-left font-bold text-[15px] rounded-xl transition-all
                                ${isLogoutHovered ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                            `}
                            title={!isSidebarExpanded ? "Log Out" : undefined}
                        >
                            <i className={`fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg shrink-0 ${isLogoutHovered ? 'text-white' : 'text-slate-400'}`}></i>
                            <span className={`whitespace-nowrap transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                Log Out
                            </span>
                        </button>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10 min-w-0">

                    {/* TOP BAR */}
                    <header className="h-16 sm:h-20 bg-transparent border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                aria-label="Toggle sidebar"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden shrink-0"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">Dashboard</h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <button aria-label="View notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:bg-slate-50 transition-colors shadow-sm">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

                        <section className="mb-6 sm:mb-8 animate-fade-up">

                            {/* NEEDS ATTENTION */}
                            <div className="mb-6 sm:mb-8">
                                <h3 className="text-sm font-bold text-slate-500 mb-3">Needs attention</h3>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <button className="px-3 sm:px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] sm:text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm">
                                        2 drafts
                                    </button>
                                    <button className="px-3 sm:px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] sm:text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm">
                                        1 scheduled for tomorrow
                                    </button>
                                    <button className="px-3 sm:px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-[11px] sm:text-xs font-bold hover:bg-red-100 transition-colors shadow-sm">
                                        4 students not verified
                                    </button>
                                </div>
                            </div>

                            {/* STATS ROW */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">Published this month</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{announcementCount}</h3>
                                        <span className="text-[10px] sm:text-xs font-bold text-emerald-600 mb-1">+4 vs last month</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">Upcoming events</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{eventCount}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">Active students</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{userCount}</h3>
                                        <span className="text-[10px] sm:text-xs font-bold text-emerald-600 mb-1">+18 this week</span>
                                    </div>
                                </div>
                            </div>

                            {/* TWO PANEL LAYOUT */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

                                {/* RECENT ANNOUNCEMENTS */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">Recent announcements</h4>
                                        <Link href="/admin/announcements" className="text-xs font-bold text-slate-500 hover:text-ctu-lightblue transition-colors shrink-0">View all</Link>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 pt-3 overflow-x-auto no-scrollbar">
                                        {([
                                            { label: 'All', count: recentAnnouncements.length },
                                            { label: 'My Posts', count: recentAnnouncements.filter((announcement) => announcement.author_admin_id === adminId).length },
                                        ] as const).map((tab) => (
                                            <button
                                                key={tab.label}
                                                type="button"
                                                onClick={() => setAnnouncementTab(tab.label)}
                                                className={`border-b-2 pb-2 text-xs font-bold transition-colors whitespace-nowrap ${
                                                    announcementTab === tab.label
                                                        ? 'border-ctu-lightblue text-ctu-lightblue'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                {tab.label} <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{tab.count}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 overflow-x-auto mobile-scroll-x">
                                        <table className="w-full min-w-[420px] text-left border-collapse">
                                            <thead>
                                                <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                                                    <th className="px-4 sm:px-6 py-2">Title</th>
                                                    <th className="px-2 sm:px-4 py-2">Status</th>
                                                    <th className="px-4 sm:px-6 py-2 w-24 sm:w-32">Read</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {visibleAnnouncements.map((announcement) => (
                                                    <tr key={announcement.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-4 sm:px-6 py-3">
                                                            <div className="flex items-start gap-2">
                                                                {announcement.is_pinned && <i className="fa-solid fa-thumbtack text-[10px] text-rose-500 mt-1 shrink-0"></i>}
                                                                <div className="min-w-0">
                                                                    <button
                                                                        onClick={() => setSelectedAnnouncement(announcement)}
                                                                        className="text-left font-bold text-slate-800 hover:text-ctu-lightblue transition-colors text-xs sm:text-sm line-clamp-1"
                                                                    >
                                                                        {announcement.title}
                                                                    </button>
                                                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">{formatDate(announcement.date)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-3">
                                                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                                                Published
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3">
                                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* UPCOMING EVENTS */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">Upcoming events</h4>
                                        <Link href="/admin/events" className="text-xs font-bold text-slate-500 hover:text-ctu-lightblue transition-colors shrink-0">+ New event</Link>
                                    </div>

                                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-4 flex-1">
                                        {upcomingEvents.length === 0 ? (
                                            <p className="p-4 text-sm font-medium text-slate-500 text-center">No upcoming events scheduled.</p>
                                        ) : upcomingEvents.map((event) => (
                                            <div key={event.id} className="flex items-start gap-3 sm:gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[44px] sm:min-w-[50px] shrink-0 h-fit">
                                                    <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                    <p className="text-lg sm:text-xl font-black leading-none mt-0.5 text-slate-800">{new Date(`${event.event_date}T00:00:00`).getDate()}</p>
                                                </div>
                                                <div className="pt-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 mb-1 group-hover:text-ctu-lightblue transition-colors line-clamp-1">{event.title}</p>
                                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>

                {selectedAnnouncement && (
                    <AnnouncementPage
                        announcement={selectedAnnouncement}
                        discussions={discussions.filter((discussion) => discussion.announcement_id === selectedAnnouncement.id)}
                        announcementComments={announcementComments
                            .filter((comment) => comment.announcement_id === selectedAnnouncement.id)
                            .flatMap((comment) => comment.messages)}
                        onClose={() => setSelectedAnnouncement(null)}
                    />
                )}

                {/* LOGOUT CONFIRMATION MODAL */}
                {isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-scale-in text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>

                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-5 border border-slate-200">
                                <i className="fa-solid fa-arrow-right-from-bracket text-slate-700 text-2xl"></i>
                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Log Out?</h3>
                            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                                Are you sure you want to log out of Cotify? You will need to sign in again to access your portal.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>

                                <Link
                                    href="/admin/logout"
                                    method="post"
                                    as="button"
                                    className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}