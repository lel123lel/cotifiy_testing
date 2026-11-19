import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AnnouncementPage, { type Announcement } from '../announcementpage';
import { summarizeAnnouncement } from '../announcementUtils';
import AdminNotificationDropdown from './AdminNotificationDropdown';
import AdminSidebar, { useAdminSidebarOpen } from './AdminSidebar';

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
    publishedThisMonthCount,
    publishedChangeFromLastMonth,
    eventCount,
    activeStudentCount,
}: {
    recentAnnouncements: Announcement[];
    upcomingEvents: UpcomingEvent[];
    discussions: Discussion[];
    announcementComments: AnnouncementComment[];
    publishedThisMonthCount: number;
    publishedChangeFromLastMonth: number;
    eventCount: number;
    activeStudentCount: number;
}) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useAdminSidebarOpen();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    // Polling for new discussions if needed
    useEffect(() => {
        const interval = window.setInterval(() => {
            router.reload({
                only: [
                    'discussions',
                    'activeStudentCount',
                    'publishedThisMonthCount',
                    'publishedChangeFromLastMonth',
                    'adminRecentNotifications',
                    'adminUnreadCount',
                ],
            });
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

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

                <AdminSidebar
                    activePage="dashboard"
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={() => setIsLogoutModalOpen(true)}
                />

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
                            <AdminNotificationDropdown />
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

                        <section className="mb-6 sm:mb-8 animate-fade-up">

                            {/* STATS ROW */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">Published this month</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{publishedThisMonthCount}</h3>
                                        <span className={`text-[10px] sm:text-xs font-bold mb-1 ${publishedChangeFromLastMonth > 0 ? 'text-emerald-600' : publishedChangeFromLastMonth < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                            {publishedChangeFromLastMonth > 0 ? '+' : ''}{publishedChangeFromLastMonth} vs last month
                                        </span>
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
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeStudentCount}</h3>
                                        <span className="text-[10px] sm:text-xs font-bold text-emerald-600 mb-1">currently logged in</span>
                                    </div>
                                </div>
                            </div>

                            {/* RECENT ANNOUNCEMENTS AND UPCOMING EVENTS */}
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
                                <div className="min-w-0 space-y-6 lg:col-span-2">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Recent Announcements from All Departments</h3>
                                            <p className="mt-1 text-sm text-slate-500">Latest updates shared by departments across campus.</p>
                                        </div>
                                        <Link href="/admin/announcements" className="shrink-0 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline">View all</Link>
                                    </div>

                                    <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white/90">
                                        {recentAnnouncements.length === 0 ? (
                                            <p className="py-8 text-center text-sm font-medium text-slate-500">No announcements yet.</p>
                                        ) : recentAnnouncements.map((announcement) => (
                                            <button
                                                key={announcement.id}
                                                type="button"
                                                onClick={() => setSelectedAnnouncement(announcement)}
                                                aria-label={`View announcement: ${announcement.title}`}
                                                className="group grid w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ctu-lightblue sm:grid-cols-[3.5rem_minmax(0,1fr)_9rem] sm:gap-y-0 sm:px-3"
                                            >
                                                <div className="row-span-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 sm:row-span-1">
                                                    {announcement.image_url ? (
                                                        <img src={announcement.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <i className="fa-regular fa-newspaper text-xl text-slate-400" aria-hidden="true"></i>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="line-clamp-1 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-ctu-lightblue sm:text-base">
                                                        {announcement.title}
                                                    </h5>
                                                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{summarizeAnnouncement(announcement.body)}</p>
                                                </div>
                                                <div className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:col-start-3 sm:flex-col sm:items-end sm:gap-1">
                                                    <span className="font-bold uppercase text-ctu-lightblue">{announcement.category || 'General'}</span>
                                                    <span className="font-medium text-slate-500">{formatDate(announcement.date)}</span>
                                                    {announcement.posted_by && (
                                                        <span className="max-w-full whitespace-normal break-words text-slate-500 sm:text-right">Posted by {announcement.posted_by}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-w-0 space-y-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Upcoming Events</h3>
                                        <Link href="/admin/events" className="shrink-0 text-sm font-bold text-violet-600 transition-colors hover:text-violet-700">+ New</Link>
                                    </div>

                                    {upcomingEvents.length === 0 ? (
                                        <div className="flex min-h-[88px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white/70 p-4 text-center">
                                            <p className="text-sm font-medium text-slate-500">No upcoming events scheduled.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white/90">
                                            {upcomingEvents.map((event) => (
                                                <div key={event.id} className="group flex items-start gap-3 px-3 py-4 transition-colors hover:bg-slate-50 sm:gap-4">
                                                    <div className="h-fit min-w-[44px] shrink-0 rounded-lg bg-slate-100 p-2 text-center sm:min-w-[50px]">
                                                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 sm:text-[10px]">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                        <p className="mt-0.5 text-lg font-black leading-none text-slate-800 sm:text-xl">{new Date(`${event.event_date}T00:00:00`).getDate()}</p>
                                                    </div>
                                                    <div className="min-w-0 pt-1">
                                                        <p className="mb-1 line-clamp-1 text-xs font-bold text-slate-900 transition-colors group-hover:text-ctu-lightblue sm:text-sm">{event.title}</p>
                                                        {event.location && <p className="line-clamp-1 text-xs text-slate-500">{event.location}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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