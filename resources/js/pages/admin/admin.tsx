import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';


type Announcement = {
    id: number;
    title: string;
    category: string;
    posted_by: string;
    date: string;
    body: string;
    image_url: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

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

export default function admin({
    announcements,
    recentAnnouncements,
    upcomingEvents,
    announcementCount,
    eventCount,
}: {
    announcements: Announcement[];
    recentAnnouncements: Announcement[];
    upcomingEvents: UpcomingEvent[];
    announcementCount: number;
    eventCount: number;
}) {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [activeFilter, setActiveFilter] = useState('all');
    const filteredAnnouncements = activeFilter === 'all'
        ? announcements
        : announcements.filter((announcement) => announcement.category === activeFilter);

    return (
        <>
            <Head title="Admin" />
            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden">
                
                <aside id="sidebar" className="w-64 bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-30 h-full transition-all duration-300">
                    <div>
                        
                        <div className="p-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-sm"></i>
                            </div>
                            <div className="text-white">
                                <h1 className="font-bold text-sm leading-tight">COTIFY</h1>
                                <p className="text-[10px] text-slate-400">College of Technology</p>
                            </div>
                        </div>
                        
                        
                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Admin</p>
                                <p className="text-slate-400 text-xs">Administrator</p>
                            </div>
                        </div>

                        
                        <nav className="mt-4 space-y-1 px-3" id="sidebarNav">
                            <a href="#dashboard" data-target="dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-house w-5 text-center"></i> Dashboard
                            </a>
                            <a href="#announcements" data-target="announcements" className="nav-link flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-bullhorn w-5 text-center"></i> Announcements
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-regular fa-calendar w-5 text-center"></i> Events
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-users w-5 text-center"></i> Users
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-regular fa-building w-5 text-center"></i> Departments
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-gear w-5 text-center"></i> Settings
                            </a>
                        </nav>
                    </div>

                    
                    <div className="p-4 border-t border-slate-800">
                        <a href="login.php" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> Log Out
                        </a>
                    </div>
                </aside>

                
                <div id="sidebarOverlay" className="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>

                
                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
                    
                    
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex items-center gap-4">
                            
                            <button id="toggleSidebarBtn" className="text-slate-500 hover:text-ctu-lightblue text-lg transition-colors" title="Toggle Navigation Bar">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            
                            <button id="mobileSidebarBtn" className="md:hidden text-slate-500 hover:text-slate-800 text-lg hidden">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <div className="relative w-64 hidden sm:block">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                <input type="text" id="globalSearch" placeholder="Search announcements..." className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all"></input>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-slate-400 hover:text-slate-600 relative">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <i className="fa-solid fa-user text-xs"></i>
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
                                <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                            </div>
                        </div>
                    </header>

                    
                    <main className="flex-1 p-6 overflow-y-auto">
                        
                        
                        <section id="dashboard" className="mb-10 section-content">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
                                <p className="text-sm text-slate-500">Overview of system activity</p>
                            </div>

                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <i className="fa-solid fa-bullhorn text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Announcements</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1" id="statTotalAnnouncements">{announcementCount}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Published announcements</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                        <i className="fa-regular fa-calendar text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Events</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{eventCount}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Published events</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                        <i className="fa-solid fa-users text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Users</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">156</h3>
                                        <p className="text-[10px] text-emerald-600 font-medium"><i className="fa-solid fa-arrow-up"></i> 5% this month</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                        <i className="fa-solid fa-building text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Departments</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">12</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">No change</p>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-700">Recent Announcements</h4>
                                        <a href="#announcements" className="text-xs text-ctu-lightblue hover:underline font-medium">View All</a>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {recentAnnouncements.length === 0 ? (
                                            <p className="p-2 text-sm text-slate-500">No announcements yet.</p>
                                        ) : recentAnnouncements.map((announcement) => (
                                            <div key={announcement.id} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">{announcement.category}</span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-800 mb-1">{announcement.title}</p>
                                                <p className="text-xs text-slate-500">{formatDate(announcement.date)} • {announcement.posted_by}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-700">Upcoming Events</h4>
                                        <a href="#announcements" className="text-xs text-ctu-lightblue hover:underline font-medium">View All</a>
                                    </div>
                                    <div className="p-4 space-y-4 flex-1">
                                        {upcomingEvents.length === 0 ? (
                                            <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
                                        ) : upcomingEvents.map((event) => (
                                            <div key={event.id} className="flex items-start gap-3">
                                                <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[50px]">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                    <p className="text-lg font-bold text-slate-800 leading-none">{new Date(`${event.event_date}T00:00:00`).getDate().toString().padStart(2, '0')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{event.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {[event.start_time && event.end_time ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}` : event.start_time?.slice(0, 5), event.location].filter(Boolean).join(' • ')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-200 mb-10"></hr>

                        
                        <section id="announcements" className="section-content">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Manage Announcements</h2>
                                    <p className="text-sm text-slate-500">Create, edit, and manage all announcements.</p>
                                </div>
                                <button id="btnNewAnnouncement" type="button" onClick={() => { setEditingAnnouncement(null); setSelectedCategory('General'); setIsNewModalOpen(true); }} className="bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0">
                                    <i className="fa-solid fa-plus"></i> New Announcement
                                </button>
                            </div>

                            
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar" id="filterTabs">
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
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            activeFilter === filter.value
                                                ? 'bg-ctu-lightblue text-white'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                                                <th className="px-4 py-3">Title</th>
                                                <th className="px-4 py-3">Body</th>
                                                <th className="px-4 py-3">Category</th>
                                                <th className="px-4 py-3">Posted By</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAnnouncements.length === 0 ? (
                                                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                                    {activeFilter === 'all' ? 'No announcements yet.' : `No ${activeFilter.toLowerCase()} announcements.`}
                                                </td></tr>
                                            ) : filteredAnnouncements.map((announcement) => (
                                                <tr key={announcement.id} className="border-b border-slate-100 text-sm text-slate-700">
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        <p title={announcement.title}>
                                                            {announcement.title.length > 15 ? `${announcement.title.slice(0, 10)}...` : announcement.title}
                                                        </p>
                                                    </td>
                                                    <td className="max-w-xs px-4 py-3 text-slate-800">
                                                        <p title={announcement.body}>
                                                            {announcement.body.length > 10 ? `${announcement.body.slice(0, 10)}...` : announcement.body}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">{announcement.category}</td>
                                                    <td className="px-4 py-3">{announcement.posted_by}</td>
                                                    <td className="px-4 py-3">{formatDate(announcement.date)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={() => { setEditingAnnouncement(announcement); setSelectedCategory(announcement.category); setIsNewModalOpen(true); }} className="rounded px-2 py-1 text-xs font-medium text-ctu-lightblue hover:bg-blue-50">Edit</button>
                                                            <button type="button" onClick={() => setAnnouncementToDelete(announcement)} className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                
                                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                                    <span id="tableInfo">Showing {filteredAnnouncements.length === 0 ? 0 : 1}-{filteredAnnouncements.length} of {filteredAnnouncements.length} announcements</span>
                                    <div className="flex items-center gap-1">
                                        <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button className="w-6 h-6 flex items-center justify-center rounded bg-ctu-lightblue text-white font-medium">1</button>
                                        <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </main>
                </div>

                
                {announcementToDelete && <div id="deleteModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="deleteAnnouncementTitle">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                            <i className="fa-solid fa-trash text-red-600 text-xl"></i>
                        </div>
                        <h3 id="deleteAnnouncementTitle" className="text-lg font-bold text-slate-800 text-center mb-2">Delete Announcement</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">Are you sure you want to delete “{announcementToDelete.title}”? This action cannot be undone.</p>
                        <div className="flex gap-3">
                                <button type="button" onClick={() => setAnnouncementToDelete(null)} className="flex-1 border border-slate-200 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
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
                                    className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                                >
                                    {isDeletingAnnouncement ? 'Deleting...' : 'Delete'}
                                </button>
                        </div>
                    </div>
                </div>}

                
                {isNewModalOpen && <div id="newModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="newAnnouncementTitle">
                    <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full p-8 max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 id="newAnnouncementTitle" className="text-lg font-bold text-slate-800">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
                            <button id="closeNewModal" type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} aria-label="Close announcement form" className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <Form key={editingAnnouncement?.id ?? 'new'} method="post" action={editingAnnouncement ? `/admin/announcements/${editingAnnouncement.id}` : '/admin/announcements'} onSuccess={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="space-y-4">
                            {({ errors, processing }) => (
                                <>
                            {editingAnnouncement && <input type="hidden" name="_method" value="put" />}
                            <div>
                                <label htmlFor="newTitle" className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                                <input type="text" id="newTitle" name="title" defaultValue={editingAnnouncement?.title ?? ''} required maxLength={255} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Enter announcement title"></input>
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label htmlFor="newCategory" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                <select id="newCategory" name="category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all">
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
                                        <label htmlFor="eventDate" className="block text-xs font-medium text-slate-600 mb-1">Event Date</label>
                                        <input type="date" id="eventDate" name="event_date" defaultValue={editingAnnouncement?.event_date ?? ''} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                        {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="eventStartTime" className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                                            <input type="time" id="eventStartTime" name="start_time" defaultValue={editingAnnouncement?.start_time?.slice(0, 5) ?? ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                            {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="eventEndTime" className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
                                            <input type="time" id="eventEndTime" name="end_time" defaultValue={editingAnnouncement?.end_time?.slice(0, 5) ?? ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                            {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="eventLocation" className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                                        <input type="text" id="eventLocation" name="location" defaultValue={editingAnnouncement?.location ?? ''} required maxLength={255} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Event venue" />
                                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                                    </div>
                                </>
                            )}
                            <div>
                                <label htmlFor="newPostedBy" className="block text-xs font-medium text-slate-600 mb-1">Posted By</label>
                                <input type="text" id="newPostedBy" name="posted_by" defaultValue={editingAnnouncement?.posted_by ?? ''} required maxLength={255} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="e.g. Office of the Registrar"></input>
                                {errors.posted_by && <p className="mt-1 text-sm text-red-600">{errors.posted_by}</p>}
                            </div>
                            <div>
                                <label htmlFor="newBody" className="block text-xs font-medium text-slate-600 mb-1">Announcement</label>
                                <textarea id="newBody" name="body" defaultValue={editingAnnouncement?.body ?? ''} required rows={5} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Write the announcement details"></textarea>
                                {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                            </div>
                            <div>
                                <label htmlFor="newImage" className="block text-xs font-medium text-slate-600 mb-1">Image (optional)</label>
                                {editingAnnouncement?.image_url && <img src={editingAnnouncement.image_url} alt="Current announcement" className="mb-2 max-h-40 rounded-lg object-contain" />}
                                <input type="file" id="newImage" name="image" accept="image/jpeg,image/png,image/gif,image/webp" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:rounded-md" />
                                <p className="mt-1 text-xs text-slate-500">{editingAnnouncement ? 'Upload a replacement image, or leave blank to keep the current image.' : 'JPEG, PNG, GIF, or WebP; up to 5 MB.'}</p>
                                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setIsNewModalOpen(false); setEditingAnnouncement(null); }} className="flex-1 border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 bg-ctu-lightblue hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors">{processing ? 'Saving...' : editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}</button>
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