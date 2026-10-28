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
    if (!time) {
        return undefined;
    }

    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);

    if (
        !/^\d{2}$/.test(hourText) ||
        !/^\d{2}$/.test(minuteText ?? '') ||
        hour > 23 ||
        Number(minuteText) > 59
    ) {
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
    const filteredAnnouncements = activeFilter === 'all'
        ? announcements
        : announcements.filter((announcement) => announcement.category === activeFilter);

    return (
        <>
            <Head title="Admin" />
            
            {/* CSS Animations for the Page */}
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
                .animate-fade-up { animation: fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden">
                
                <aside id="sidebar" className="w-64 bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-30 h-full transition-all duration-300 shadow-2xl md:shadow-none">
                    <div>
                        
                        <div className="p-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
                                <i className="fa-solid fa-gear text-ctu-dark text-sm"></i>
                            </div>
                            <div className="text-white">
                                <h1 className="font-bold text-sm leading-tight">COTIFY</h1>
                                <p className="text-[10px] text-slate-400">College of Technology</p>
                            </div>
                        </div>
                        
                        
                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm ring-2 ring-slate-600">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Admin</p>
                                <p className="text-slate-400 text-xs">Administrator</p>
                            </div>
                        </div>

                        
                        <nav className="mt-4 space-y-1.5 px-3" id="sidebarNav">
                            <a href="#dashboard" data-target="dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-900/20">
                                <i className="fa-solid fa-house w-5 text-center"></i> Dashboard
                            </a>
                            <Link href="/admin/users" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-all group">
                                <i className="fa-solid fa-users w-5 text-center group-hover:scale-110 transition-transform"></i> Users
                            </Link>
                            <Link href="/admin/settings" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-all group">
                                <i className="fa-solid fa-gear w-5 text-center group-hover:rotate-90 transition-transform duration-300"></i> Settings
                            </Link>
                        </nav>
                    </div>

                    
                    <div className="p-4 border-t border-slate-800/50">
                        <Form method="post" action="/admin/logout">
                            {({ processing }) => (
                                <button type="submit" disabled={processing} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-slate-400 transition-colors hover:text-red-400 hover:bg-slate-800/50 rounded-xl disabled:opacity-60">
                                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> {processing ? 'Logging Out...' : 'Log Out'}
                                </button>
                            )}
                        </Form>
                    </div>
                </aside>

                
                <div id="sidebarOverlay" className="fixed inset-0 bg-black/50 z-20 hidden md:hidden animate-fade-in"></div>

                
                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
                    
                    {/* CHANGED: Header background to match sidebar (bg-ctu-dark) */}
                    <header className="h-16 bg-ctu-dark border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm transition-colors">
                        <div className="flex items-center gap-4">
                            
                            {/* CHANGED: Button colors to fit dark header */}
                            <button id="toggleSidebarBtn" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors" title="Toggle Navigation Bar">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            
                            <button id="mobileSidebarBtn" className="md:hidden text-slate-300 hover:text-white text-lg hidden">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            {/* CHANGED: Search input dark theme */}
                            <div className="relative w-64 hidden sm:block group">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-ctu-lightblue transition-colors"></i>
                                <input type="text" id="globalSearch" placeholder="Search announcements..." className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:bg-slate-900 focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400"></input>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* CHANGED: Bell icon to white/slate */}
                            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 relative transition-colors">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-ctu-dark animate-pulse"></span>
                            </button>
                            
                            {/* CHANGED: Profile section text/border colors */}
                            <div className="flex items-center gap-2 cursor-pointer pl-4 border-l border-slate-700 group">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-ctu-lightblue group-hover:text-white transition-colors">
                                    <i className="fa-solid fa-user text-xs"></i>
                                </div>
                                <span className="text-sm font-medium text-slate-200 hidden sm:block group-hover:text-white transition-colors">Admin</span>
                                <i className="fa-solid fa-chevron-down text-xs text-slate-400 group-hover:text-white transition-colors"></i>
                            </div>
                        </div>
                    </header>

                    
                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        
                        
                        <section id="dashboard" className="mb-12 section-content animate-fade-up">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                                <p className="text-sm text-slate-500 mt-1">Overview of system activity</p>
                            </div>

                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <i className="fa-solid fa-bullhorn text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Announcements</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1" id="statTotalAnnouncements">{announcementCount}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">Published announcements</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <i className="fa-regular fa-calendar text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Events</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{eventCount}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">Published events</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                                    <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                        <i className="fa-solid fa-users text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Users</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{userCount}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">Registered accounts</p>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h4 className="font-bold text-sm text-slate-800">Recent Announcements</h4>
                                        <a href="#announcements" className="text-xs text-ctu-lightblue hover:underline font-semibold">View All</a>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {recentAnnouncements.length === 0 ? (
                                            <p className="p-3 text-sm text-slate-500">No announcements yet.</p>
                                        ) : recentAnnouncements.map((announcement) => (
                                            <div key={announcement.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">{announcement.category}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="mb-1 block text-left text-sm font-bold text-slate-800 hover:text-ctu-lightblue transition-colors"
                                                >
                                                    {announcement.title}
                                                </button>
                                                <p className="text-xs text-slate-500">{formatDate(announcement.date)} • {announcement.posted_by}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h4 className="font-bold text-sm text-slate-800">Upcoming Events</h4>
                                        <a href="#announcements" className="text-xs text-ctu-lightblue hover:underline font-semibold">View All</a>
                                    </div>
                                    <div className="p-4 space-y-4 flex-1">
                                        {upcomingEvents.length === 0 ? (
                                            <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
                                        ) : upcomingEvents.map((event) => (
                                            <div key={event.id} className="flex items-start gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <div className="bg-blue-50 text-blue-700 rounded-xl p-2 text-center min-w-[55px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                    <p className="text-lg font-bold leading-none mt-0.5">{new Date(`${event.event_date}T00:00:00`).getDate().toString().padStart(2, '0')}</p>
                                                </div>
                                                <div className="pt-1">
                                                    <p className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{event.title}</p>
                                                    <p className="text-xs text-slate-500">
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

                        
                        <section id="announcements" className="section-content animate-fade-up" style={{ animationDelay: '0.05s' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Manage Announcements</h2>
                                    <p className="text-sm text-slate-500 mt-1">Create, edit, and manage all announcements.</p>
                                </div>
                                <button id="btnNewAnnouncement" type="button" onClick={() => { setEditingAnnouncement(null); setSelectedCategory('General'); setIsNewModalOpen(true); }} className="bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 shrink-0">
                                    <i className="fa-solid fa-plus"></i> New Announcement
                                </button>
                            </div>

                            
                            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar" id="filterTabs">
                                {[
                                    { value: 'all', label: 'All' },
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
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            activeFilter === filter.value
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                                <th className="px-6 py-4">Title</th>
                                                <th className="px-6 py-4">Body</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Posted By</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredAnnouncements.length === 0 ? (
                                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 font-medium">
                                                    {activeFilter === 'all' ? 'No announcements yet.' : `No ${activeFilter.toLowerCase()} announcements.`}
                                                </td></tr>
                                            ) : filteredAnnouncements.map((announcement) => (
                                                <tr key={announcement.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                                        <button
                                                            type="button"
                                                            title={announcement.title}
                                                            onClick={() => setSelectedAnnouncement(announcement)}
                                                            className="text-left hover:text-ctu-lightblue transition-colors"
                                                        >
                                                            {announcement.title.length > 15 ? `${announcement.title.slice(0, 10)}...` : announcement.title}
                                                        </button>
                                                    </td>
                                                    <td className="max-w-xs px-6 py-4 text-slate-600">
                                                        <p title={announcement.body}>
                                                            {announcement.body.length > 10 ? `${announcement.body.slice(0, 10)}...` : announcement.body}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                                            announcement.category === 'Academic' ? 'bg-blue-100 text-blue-700' :
                                                            announcement.category === 'Event' ? 'bg-emerald-100 text-emerald-700' :
                                                            announcement.category === 'Service' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {announcement.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{announcement.posted_by}</td>
                                                    <td className="px-6 py-4 text-slate-500">{formatDate(announcement.date)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button type="button" onClick={() => { setEditingAnnouncement(announcement); setSelectedCategory(announcement.category); setIsNewModalOpen(true); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Edit"><i className="fa-solid fa-pen text-xs"></i></button>
                                                            <button type="button" onClick={() => setAnnouncementToDelete(announcement)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors" title="Delete"><i className="fa-solid fa-trash text-xs"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                
                                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                                    <span id="tableInfo">Showing {filteredAnnouncements.length === 0 ? 0 : 1}-{filteredAnnouncements.length} of {filteredAnnouncements.length} announcements</span>
                                    <div className="flex items-center gap-1">
                                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button className="px-3 py-1.5 rounded-lg bg-ctu-lightblue text-white shadow-sm">1</button>
                                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
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

                {announcementToDelete && <div id="deleteModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="deleteAnnouncementTitle">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-scale-in text-center">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-red-600 text-2xl"></i>
                        </div>
                        <h3 id="deleteAnnouncementTitle" className="text-xl font-bold text-slate-900 mb-2">Delete Announcement</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete “{announcementToDelete.title}”? This action cannot be undone.</p>
                        <div className="flex gap-3">
                                <button type="button" onClick={() => setAnnouncementToDelete(null)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
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
                                    className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors shadow-lg shadow-red-500/30"
                                >
                                    {isDeletingAnnouncement ? 'Deleting...' : 'Delete'}
                                </button>
                        </div>
                    </div>
                </div>}

                
                {isNewModalOpen && <div id="newModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="newAnnouncementTitle">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 max-h-[95vh] overflow-y-auto animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 id="newAnnouncementTitle" className="text-xl font-bold text-slate-900">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
                            <button id="closeNewModal" type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} aria-label="Close announcement form" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <Form key={editingAnnouncement?.id ?? 'new'} method="post" action={editingAnnouncement ? `/admin/announcements/${editingAnnouncement.id}` : '/admin/announcements'} onSuccess={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                            {editingAnnouncement && <input type="hidden" name="_method" value="put" />}
                            <div>
                                <label htmlFor="newTitle" className="block text-xs font-bold text-slate-600 mb-1.5">Title</label>
                                <input type="text" id="newTitle" name="title" defaultValue={editingAnnouncement?.title ?? ''} required maxLength={255} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Enter announcement title"></input>
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label htmlFor="newCategory" className="block text-xs font-bold text-slate-600 mb-1.5">Category</label>
                                <select id="newCategory" name="category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                                    <option value="General">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Event">Event</option>
                                    <option value="Service">Service</option>
                                </select>
                                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                            </div>
                            {selectedCategory === 'Event' && (
                                <>
                                    <div>
                                        <label htmlFor="eventDate" className="block text-xs font-bold text-slate-600 mb-1.5">Event Date</label>
                                        <input type="date" id="eventDate" name="event_date" defaultValue={editingAnnouncement?.event_date ?? ''} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                        {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="eventStartTime" className="block text-xs font-bold text-slate-600 mb-1.5">Start Time</label>
                                            <input type="time" id="eventStartTime" name="start_time" defaultValue={editingAnnouncement?.start_time?.slice(0, 5) ?? ''} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                            {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="eventEndTime" className="block text-xs font-bold text-slate-600 mb-1.5">End Time</label>
                                            <input type="time" id="eventEndTime" name="end_time" defaultValue={editingAnnouncement?.end_time?.slice(0, 5) ?? ''} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                            {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="eventLocation" className="block text-xs font-bold text-slate-600 mb-1.5">Location</label>
                                        <input type="text" id="eventLocation" name="location" defaultValue={editingAnnouncement?.location ?? ''} required maxLength={255} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Event venue" />
                                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                                    </div>
                                </>
                            )}
                            <div>
                                <label htmlFor="newPostedBy" className="block text-xs font-bold text-slate-600 mb-1.5">Posted By</label>
                                <input type="text" id="newPostedBy" name="posted_by" defaultValue={editingAnnouncement?.posted_by ?? ''} required maxLength={255} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Office of the Registrar"></input>
                                {errors.posted_by && <p className="mt-1 text-sm text-red-600">{errors.posted_by}</p>}
                            </div>
                            <div>
                                <label htmlFor="newBody" className="block text-xs font-bold text-slate-600 mb-1.5">Announcement</label>
                                <textarea id="newBody" name="body" defaultValue={editingAnnouncement?.body ?? ''} required rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none" placeholder="Write the announcement details"></textarea>
                                {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                            </div>
                            <div>
                                <label htmlFor="newImage" className="block text-xs font-bold text-slate-600 mb-1.5">Image (optional)</label>
                                {editingAnnouncement?.image_url && <img src={editingAnnouncement.image_url} alt="Current announcement" className="mb-3 max-h-40 rounded-xl object-contain border border-slate-200 p-1" />}
                                <input type="file" id="newImage" name="image" accept="image/jpeg,image/png,image/gif,image/webp" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:border-0 file:bg-blue-50 file:text-blue-700 file:px-4 file:py-2 file:rounded-lg file:font-semibold hover:file:bg-blue-100 transition-all cursor-pointer" />
                                <p className="mt-2 text-xs text-slate-500">{editingAnnouncement ? 'Upload a replacement image, or leave blank to keep the current image.' : 'JPEG, PNG, GIF, or WebP; up to 5 MB.'}</p>
                                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 bg-ctu-lightblue hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">{processing ? 'Saving...' : editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}</button>
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