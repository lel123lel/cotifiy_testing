import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AnnouncementPage, { type Announcement } from '../announcementpage';

type UpcomingEvent = {
    id: number;
    title: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const formatTime = (time: string | null) => {
    if (!time) return undefined;
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    if (!/^\d{2}$/.test(hourText) || !/^\d{2}$/.test(minuteText ?? '') || hour > 23 || Number(minuteText) > 59) {
        return time.slice(0, 5);
    }
    return `${hour % 12 || 12}:${minuteText} ${hour < 12 ? 'AM' : 'PM'}`;
};

export default function admin({
    announcements,
    recentAnnouncements,
    upcomingEvents,
    announcementCount,
    eventCount,
    userCount,
}: {
    announcements: Announcement[];
    recentAnnouncements: Announcement[];
    upcomingEvents: UpcomingEvent[];
    announcementCount: number;
    eventCount: number;
    userCount: number;
}) {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [activeFilter, setActiveFilter] = useState('all');
    
    // REACT STATE FOR SIDEBAR
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // NEW STATE: To force the logout button hover effect via React
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    const filteredAnnouncements = activeFilter === 'all'
        ? announcements
        : announcements.filter((announcement) => announcement.category === activeFilter);

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
                
                /* Moving Shapes Keyframes */
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

                    <div className="absolute top-[10%] right-[40%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-blue-500/5 shape-move-2"></div>
                    <div className="absolute top-[30%] right-[5%] w-3 h-48 bg-gradient-to-b from-blue-500/10 to-transparent rounded-full shape-move-1"></div>
                </div>

                {/* SIDEBAR */}
                <aside 
                    className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 shadow-2xl md:shadow-none 
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}
                >
                    <div className="w-64">
                        {/* CHANGED: Replaced icon with larger logo and adjusted margins */}
                        <div className="p-6 flex items-center">
                            <img 
                                src="/images/3rdLogo.png" 
                                alt="Cotify Logo" 
                                className="w-16 h-16 object-contain -ml-3 -mr-2" 
                            />
                            <div className="text-white">
                                <h1 className="font-extrabold text-lg leading-tight tracking-tight">Cotify</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-sm ring-2 ring-slate-700">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">Admin</p>
                                <p className="text-slate-400 text-xs font-medium">Administrator</p>
                            </div>
                        </div>

                        <nav className="mt-6 space-y-1.5 px-3" id="sidebarNav">
                            <a href="#dashboard" data-target="dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-900/30">
                                <i className="fa-solid fa-house w-5 text-center"></i> Dashboard
                            </a>
                            <Link href="/admin/users" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all group">
                                <i className="fa-solid fa-users w-5 text-center group-hover:scale-110 transition-transform"></i> Users
                            </Link>
                            <Link href="/admin/settings" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all group">
                                <i className="fa-solid fa-gear w-5 text-center group-hover:rotate-90 transition-transform duration-300"></i> Settings
                            </Link>
                        </nav>
                    </div>

                    <div className="p-4 border-t border-slate-800/50 w-64">
                        <Form method="post" action="/admin/logout">
                            {({ processing }) => (
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    onMouseEnter={() => setIsLogoutHovered(true)}
                                    onMouseLeave={() => setIsLogoutHovered(false)}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold rounded-xl transition-all disabled:opacity-60
                                        ${isLogoutHovered ? 'bg-red-600 text-white' : 'text-slate-400'}
                                    `}
                                >
                                    <i className={`fa-solid fa-arrow-right-from-bracket w-5 text-center transition-colors ${isLogoutHovered ? 'text-white' : 'text-slate-400'}`}></i> 
                                    {processing ? 'Logging Out...' : 'Log Out'}
                                </button>
                            )}
                        </Form>
                    </div>
                </aside>

                {/* Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    <header className="h-20 bg-ctu-dark border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md transition-colors">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700" 
                                title="Toggle Navigation Bar"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <div className="relative w-72 hidden sm:block group">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-ctu-lightblue transition-colors"></i>
                                <input type="text" id="globalSearch" placeholder="Search anything..." className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 text-white rounded-xl text-sm focus:bg-slate-900 focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400 font-medium"></input>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 relative transition-colors">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-ctu-dark animate-pulse"></span>
                            </button>
                            
                            <div className="flex items-center gap-3 cursor-pointer pl-5 border-l border-slate-700 group">
                                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 group-hover:bg-ctu-lightblue group-hover:text-white group-hover:border-ctu-lightblue transition-all">
                                    <i className="fa-solid fa-user text-xs"></i>
                                </div>
                                <span className="text-sm font-bold text-slate-200 hidden sm:block group-hover:text-white transition-colors">Admin</span>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        
                        <section id="dashboard" className="mb-12 section-content animate-fade-up">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Welcome back. Here is the latest system activity.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Announcements</p>
                                            <h3 className="text-4xl font-extrabold text-slate-900" id="statTotalAnnouncements">{announcementCount}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                            <i className="fa-solid fa-bullhorn text-xl"></i>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 font-bold flex items-center gap-1.5"><i className="fa-solid fa-arrow-trend-up"></i> Published posts</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Total Events</p>
                                            <h3 className="text-4xl font-extrabold text-slate-900">{eventCount}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                            <i className="fa-regular fa-calendar text-xl"></i>
                                        </div>
                                    </div>
                                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5"><i className="fa-solid fa-arrow-trend-up"></i> Scheduled events</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-1">Total Users</p>
                                            <h3 className="text-4xl font-extrabold text-slate-900">{userCount}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                            <i className="fa-solid fa-users text-xl"></i>
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600 font-bold flex items-center gap-1.5"><i className="fa-solid fa-user-plus"></i> Registered accounts</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h4 className="font-extrabold text-slate-900">Recent Announcements</h4>
                                        <a href="#announcements" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</a>
                                    </div>
                                    <div className="p-3 space-y-2 flex-1">
                                        {recentAnnouncements.length === 0 ? (
                                            <p className="p-4 text-sm font-medium text-slate-500 text-center">No announcements yet.</p>
                                        ) : recentAnnouncements.map((announcement) => (
                                            <div key={announcement.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700">{announcement.category}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="mb-1.5 block text-left text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
                                                >
                                                    {announcement.title}
                                                </button>
                                                <p className="text-xs font-semibold text-slate-500"><i className="fa-regular fa-clock mr-1"></i> {formatDate(announcement.date)} • {announcement.posted_by}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h4 className="font-extrabold text-slate-900">Upcoming Events</h4>
                                        <a href="#announcements" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</a>
                                    </div>
                                    <div className="p-4 space-y-4 flex-1">
                                        {upcomingEvents.length === 0 ? (
                                            <p className="p-4 text-sm font-medium text-slate-500 text-center">No upcoming events scheduled.</p>
                                        ) : upcomingEvents.map((event) => (
                                            <div key={event.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                                                <div className="bg-blue-50 text-blue-700 rounded-xl p-3 text-center min-w-[60px] group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                                    <p className="text-[10px] font-extrabold uppercase tracking-widest">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                    <p className="text-xl font-black leading-none mt-0.5">{new Date(`${event.event_date}T00:00:00`).getDate().toString().padStart(2, '0')}</p>
                                                </div>
                                                <div className="pt-1">
                                                    <p className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</p>
                                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                        <i className="fa-regular fa-clock text-slate-400"></i>
                                                        {[event.start_time && event.end_time ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}` : formatTime(event.start_time), event.location].filter(Boolean).join(' • ')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-200 mb-10"></hr>

                        <section id="announcements" className="section-content animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Announcements</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Create, edit, and manage all campus updates.</p>
                                </div>
                                <button id="btnNewAnnouncement" type="button" onClick={() => { setEditingAnnouncement(null); setSelectedCategory('General'); setIsNewModalOpen(true); }} className="bg-ctu-dark hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 shrink-0">
                                    <i className="fa-solid fa-plus"></i> New Announcement
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar" id="filterTabs">
                                {[
                                    { value: 'all', label: 'All Updates' },
                                    { value: 'General', label: 'General' },
                                    { value: 'Academic', label: 'Academic' },
                                    { value: 'Event', label: 'Events' },
                                    { value: 'Service', label: 'Service' },
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        aria-pressed={activeFilter === filter.value}
                                        onClick={() => setActiveFilter(filter.value)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                            activeFilter === filter.value
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                                                <th className="px-6 py-5">Title</th>
                                                <th className="px-6 py-5">Body</th>
                                                <th className="px-6 py-5">Category</th>
                                                <th className="px-6 py-5">Posted By</th>
                                                <th className="px-6 py-5">Date</th>
                                                <th className="px-6 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredAnnouncements.length === 0 ? (
                                                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm font-medium text-slate-500">
                                                    {activeFilter === 'all' ? 'No announcements yet.' : `No ${activeFilter.toLowerCase()} announcements.`}
                                                </td></tr>
                                            ) : filteredAnnouncements.map((announcement) => (
                                                <tr key={announcement.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-900">
                                                        <button
                                                            type="button"
                                                            title={announcement.title}
                                                            onClick={() => setSelectedAnnouncement(announcement)}
                                                            className="text-left hover:text-ctu-lightblue transition-colors line-clamp-1"
                                                        >
                                                            {announcement.title}
                                                        </button>
                                                    </td>
                                                    <td className="max-w-xs px-6 py-4 font-medium text-slate-500">
                                                        <p title={announcement.body} className="line-clamp-1">
                                                            {announcement.body}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                                                            announcement.category === 'Academic' ? 'bg-blue-100 text-blue-700' :
                                                            announcement.category === 'Event' ? 'bg-emerald-100 text-emerald-700' :
                                                            announcement.category === 'Service' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {announcement.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-600">{announcement.posted_by}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-500">{formatDate(announcement.date)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button type="button" onClick={() => { setEditingAnnouncement(announcement); setSelectedCategory(announcement.category); setIsNewModalOpen(true); }} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit"><i className="fa-solid fa-pen text-xs"></i></button>
                                                            <button type="button" onClick={() => setAnnouncementToDelete(announcement)} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Delete"><i className="fa-solid fa-trash text-xs"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                                    <span id="tableInfo">Showing {filteredAnnouncements.length === 0 ? 0 : 1}-{filteredAnnouncements.length} of {filteredAnnouncements.length} announcements</span>
                                    <div className="flex items-center gap-1.5">
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-ctu-lightblue text-white shadow-sm">1</button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>

                {selectedAnnouncement && (
                    <AnnouncementPage
                        announcement={selectedAnnouncement}
                        onClose={() => setSelectedAnnouncement(null)}
                    />
                )}

                {announcementToDelete && <div id="deleteModal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 animate-scale-in text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-5 border border-red-100">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                        </div>
                        <h3 id="deleteAnnouncementTitle" className="text-xl font-extrabold text-slate-900 mb-2">Delete Announcement</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Are you sure you want to delete <strong className="text-slate-800">“{announcementToDelete.title}”</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                                <button type="button" onClick={() => setAnnouncementToDelete(null)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    type="button"
                                    disabled={isDeletingAnnouncement}
                                    onClick={() => {
                                        setIsDeletingAnnouncement(true);
                                        router.post(`/admin/announcements/${announcementToDelete.id}`, {
                                            _method: 'delete',
                                        }, {
                                            onSuccess: () => setAnnouncementToDelete(null),
                                            onFinish: () => setIsDeletingAnnouncement(false),
                                        });
                                    }}
                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-all shadow-lg shadow-red-500/30"
                                >
                                    {isDeletingAnnouncement ? 'Deleting...' : 'Delete'}
                                </button>
                        </div>
                    </div>
                </div>}

                {isNewModalOpen && <div id="newModal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-8 sm:p-10 max-h-[95vh] overflow-y-auto animate-scale-in">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                            <h3 id="newAnnouncementTitle" className="text-2xl font-extrabold text-slate-900">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
                            <button id="closeNewModal" type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"><i className="fa-solid fa-times text-lg"></i></button>
                        </div>
                        <Form key={editingAnnouncement?.id ?? 'new'} method="post" action={editingAnnouncement ? `/admin/announcements/${editingAnnouncement.id}` : '/admin/announcements'} onSuccess={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="space-y-6">
                            {({ errors, processing }) => (
                                <>
                            {editingAnnouncement && <input type="hidden" name="_method" value="put" />}
                            
                            <div>
                                <label htmlFor="newTitle" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Title</label>
                                <input type="text" id="newTitle" name="title" defaultValue={editingAnnouncement?.title ?? ''} required maxLength={255} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Enter announcement title"></input>
                                {errors.title && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.title}</p>}
                            </div>
                            
                            <div>
                                <label htmlFor="newCategory" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                                <select id="newCategory" name="category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                                    <option value="General">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Event">Event</option>
                                    <option value="Service">Service</option>
                                </select>
                                {errors.category && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.category}</p>}
                            </div>

                            {selectedCategory === 'Event' && (
                                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-5">
                                    <div>
                                        <label htmlFor="eventDate" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Event Date</label>
                                        <input type="date" id="eventDate" name="event_date" defaultValue={editingAnnouncement?.event_date ?? ''} required className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                        {errors.event_date && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.event_date}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="eventStartTime" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Start Time</label>
                                            <input type="time" id="eventStartTime" name="start_time" defaultValue={editingAnnouncement?.start_time?.slice(0, 5) ?? ''} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                            {errors.start_time && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.start_time}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="eventEndTime" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">End Time</label>
                                            <input type="time" id="eventEndTime" name="end_time" defaultValue={editingAnnouncement?.end_time?.slice(0, 5) ?? ''} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                            {errors.end_time && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.end_time}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="eventLocation" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Location</label>
                                        <input type="text" id="eventLocation" name="location" defaultValue={editingAnnouncement?.location ?? ''} required maxLength={255} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Event venue" />
                                        {errors.location && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.location}</p>}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="newPostedBy" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Posted By</label>
                                <input type="text" id="newPostedBy" name="posted_by" defaultValue={editingAnnouncement?.posted_by ?? ''} required maxLength={255} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Office of the Registrar"></input>
                                {errors.posted_by && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.posted_by}</p>}
                            </div>
                            
                            <div>
                                <label htmlFor="newBody" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Announcement Details</label>
                                <textarea id="newBody" name="body" defaultValue={editingAnnouncement?.body ?? ''} required rows={5} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none" placeholder="Write the announcement details"></textarea>
                                {errors.body && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.body}</p>}
                            </div>
                            
                            <div>
                                <label htmlFor="newImage" className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Cover Image (optional)</label>
                                {editingAnnouncement?.image_url && <img src={editingAnnouncement.image_url} alt="Current announcement" className="mb-3 max-h-48 rounded-xl object-contain border border-slate-200 p-1 bg-white" />}
                                <input type="file" id="newImage" name="image" accept="image/jpeg,image/png,image/gif,image/webp" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium file:mr-4 file:border-0 file:bg-blue-100 file:text-blue-700 file:px-4 file:py-2 file:rounded-lg file:font-bold hover:file:bg-blue-200 transition-all cursor-pointer" />
                                <p className="mt-2 text-xs font-medium text-slate-500">{editingAnnouncement ? 'Upload a replacement image, or leave blank to keep the current image.' : 'JPEG, PNG, GIF, or WebP; up to 5 MB.'}</p>
                                {errors.image && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.image}</p>}
                            </div>
                            
                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="flex-1 border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 bg-ctu-dark hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20">{processing ? 'Saving...' : editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}</button>
                            </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>}

            </div>
        </>
    )
}