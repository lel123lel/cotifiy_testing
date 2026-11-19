import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import StaffSidebar from './StaffSidebar';
import StaffNotificationDropdown from './StaffNotificationDropdown';

type UpcomingEvent = {
    id: number;
    title: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    rsvp_count?: number;
    capacity?: number;
    image?: string | null;
};

type Announcement = {
    id: number;
    title: string;
    category: string;
    date: string;
    posted_by?: string;
    image_url?: string | null;
    body?: string;
};

const summarizeAnnouncement = (body = '') => {
    const text = body
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[`*_~>#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!text) return 'No summary available.';
    return text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
};

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

// ============ URGENCY HEATMAP LOGIC ============
type UrgencyLevel = 'urgent' | 'soon' | 'info' | 'default';

interface UrgencyTheme {
    level: UrgencyLevel;
    label: string;
    spineColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    bgTint: string;
    calendarBg: string;
    calendarText: string;
    pulse?: boolean;
}

// For Upcoming Events
function getEventUrgencyTheme(event: UpcomingEvent): UrgencyTheme {
    const now = new Date();
    let eventStart: Date | null = null;
    
    if (event.event_date) {
        const timeStr = event.start_time || '00:00';
        eventStart = new Date(`${event.event_date}T${timeStr}`);
    }

    const diffMs = eventStart ? eventStart.getTime() - now.getTime() : 0;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (eventStart && diffHours > 0 && diffHours <= 24) {
        return {
            level: 'urgent',
            label: diffHours <= 1 ? 'Starting < 1 hr' : `Starting in ${Math.round(diffHours)} hrs`,
            spineColor: 'bg-red-500',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            badgeBorder: 'border-red-200',
            bgTint: 'bg-red-50', 
            calendarBg: 'bg-red-100',
            calendarText: 'text-red-800',
            pulse: true,
        };
    }

    if (eventStart && diffHours > 24 && diffHours <= 168) {
        const days = Math.ceil(diffHours / 24);
        return {
            level: 'soon',
            label: `Starts in ${days} day${days === 1 ? '' : 's'}`,
            spineColor: 'bg-amber-500',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-700',
            badgeBorder: 'border-amber-200',
            bgTint: 'bg-amber-50', 
            calendarBg: 'bg-amber-100',
            calendarText: 'text-amber-800',
        };
    }

    return {
        level: 'default',
        label: 'Upcoming',
        spineColor: 'bg-purple-500',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700',
        badgeBorder: 'border-purple-200',
        bgTint: 'bg-white',
        calendarBg: 'bg-purple-50',
        calendarText: 'text-purple-800',
    };
}

// For Recent Announcements
function getAnnouncementUrgencyTheme(ann: Announcement): UrgencyTheme {
    const titleLower = ann.title.toLowerCase();
    const bodyLower = ann.body?.toLowerCase() || '';
    
    const goodNewsKeywords = ['dean', 'award', 'achieve', 'winner', 'honor', 'congrat', 'success', 'top', 'passed', 'excellence', 'champion'];
    const isGoodNews = goodNewsKeywords.some(k => titleLower.includes(k) || bodyLower.includes(k));

    if (isGoodNews) {
        return {
            level: 'info',
            label: 'Good News',
            spineColor: 'bg-emerald-500',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            badgeBorder: 'border-emerald-200',
            bgTint: 'bg-emerald-50',
            calendarBg: '',
            calendarText: '',
        };
    }

    if (ann.category === 'Event' || ann.category === 'Academic') {
        return {
            level: 'info',
            label: ann.category === 'Event' ? 'Event' : 'Academic',
            spineColor: 'bg-blue-500',
            badgeBg: 'bg-blue-100',
            badgeText: 'text-blue-700',
            badgeBorder: 'border-blue-200',
            bgTint: 'bg-blue-50',
            calendarBg: '',
            calendarText: '',
        };
    }

    return {
        level: 'default',
        label: ann.category || 'Notice',
        spineColor: 'bg-slate-400',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        bgTint: 'bg-white',
        calendarBg: '',
        calendarText: '',
    };
}

export default function StaffDashboard({
    recentAnnouncements = [],
    upcomingEvents = [],
    announcementCount = 0,
    eventCount = 0,
    userName = 'Staff User',
}: {
    recentAnnouncements: Announcement[];
    upcomingEvents: UpcomingEvent[];
    announcementCount: number;
    eventCount: number;
    userName?: string;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Staff Dashboard | Cotify" />
            
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes pulse-urgent { 
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 
                    50% { opacity: 0.9; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); } 
                }
                
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }

                .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pulse-urgent { animation: pulse-urgent 2.5s ease-in-out infinite; }
                
                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                {/* MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] left-[5%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[2px] border-blue-500/10 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[3px] border-indigo-500/10 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-500/15 rounded-full shape-move-3"></div>
                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/5 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[3px] border-indigo-500/10 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>
                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-indigo-500/5 clip-octagon shape-move-3"></div>
                </div>

                <StaffSidebar activePage="dashboard" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userName={userName} />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    {/* TOP BAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                aria-label="Toggle sidebar"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden" 
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Staff Dashboard</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                            <StaffNotificationDropdown />
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <section className="mb-8 animate-fade-up max-w-[1200px] mx-auto">
                            
                            {/* STATS ROW */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <Link href="/staff/announcements" aria-label="View my announcements" className="block rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 border border-blue-100 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                                    <p className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider">My Announcements</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-4xl font-extrabold text-slate-900">{announcementCount}</h3>
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                                            <i className="fa-solid fa-bullhorn"></i>
                                        </div>
                                    </div>
                                </Link>
                                <Link
                                    href="/staff/announcements?tab=my-posts&category=Event"
                                    aria-label="View my event posts"
                                    className="block rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                                >
                                    <p className="text-sm font-bold text-purple-600 mb-2 uppercase tracking-wider">My Events</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-4xl font-extrabold text-slate-900">{eventCount}</h3>
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
                                            <i className="fa-regular fa-calendar"></i>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* TWO COLUMN LAYOUT FOR CARDS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* RECENT ANNOUNCEMENTS */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">Recent Announcements from All Departments</h3>
                                            <p className="mt-1 text-sm text-slate-500">Latest updates shared by departments across campus.</p>
                                        </div>
                                        <Link href="/staff/announcements" className="shrink-0 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                            View all
                                        </Link>
                                    </div>

                                    {/* Announcement List with Heatmap */}
                                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        {recentAnnouncements.length === 0 ? (
                                            <p className="py-8 text-center text-sm font-medium text-slate-500">No announcements yet.</p>
                                        ) : recentAnnouncements.map((announcement) => {
                                            const urgency = getAnnouncementUrgencyTheme(announcement);
                                            
                                            return (
                                            <div key={announcement.id} className="group relative">
                                                {/* Left Spine */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgency.spineColor}`} />
                                                
                                                <Link
                                                    href={`/staff/announcements?announcement=${announcement.id}`}
                                                    aria-label={`View announcement: ${announcement.title}`}
                                                    className={`grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 p-4 transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 sm:grid-cols-[3.5rem_minmax(0,1fr)_9rem] sm:gap-y-0 sm:px-5 ${urgency.bgTint}`}
                                                >
                                                    <div className="row-span-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200 sm:row-span-1">
                                                        {announcement.image_url ? (
                                                            <img src={announcement.image_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <i className="fa-regular fa-newspaper text-xl text-slate-400" aria-hidden="true"></i>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="line-clamp-1 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base">
                                                            {announcement.title}
                                                        </h4>
                                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                                            {summarizeAnnouncement(announcement.body)}
                                                        </p>
                                                    </div>
                                                    <div className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:col-start-3 sm:flex-col sm:items-end sm:gap-1">
                                                        <span className={`rounded px-2 py-0.5 font-bold uppercase border ${urgency.badgeBg} ${urgency.badgeText} ${urgency.badgeBorder}`}>
                                                            {urgency.label}
                                                        </span>
                                                        <span className="font-medium text-slate-500">{formatDate(announcement.date)}</span>
                                                        {announcement.posted_by && (
                                                            <span className="max-w-full whitespace-normal break-words text-slate-500 sm:text-right">Posted by {announcement.posted_by}</span>
                                                        )}
                                                    </div>
                                                </Link>
                                            </div>
                                        )})}
                                    </div>
                                </div>

                                {/* UPCOMING EVENTS */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upcoming Events</h3>
                                        <Link href="/staff/events" className="text-sm font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors">
                                            + New
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {upcomingEvents.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                                <p className="text-sm font-medium text-slate-500">No upcoming events scheduled.</p>
                                            </div>
                                        ) : upcomingEvents.map((event) => {
                                            const urgency = getEventUrgencyTheme(event);
                                            
                                            return (
                                            <div 
                                                key={event.id} 
                                                className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer bg-white ${urgency.bgTint}`}
                                            >
                                                {/* Left Spine */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${urgency.spineColor} ${urgency.pulse ? 'animate-pulse-urgent' : ''}`} />

                                                {/* Calendar Date Block */}
                                                <div className={`flex flex-col items-center justify-center rounded-xl p-3 shrink-0 min-w-[64px] ${urgency.calendarBg} ${urgency.calendarText}`}>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-2xl font-black leading-none mt-1">{new Date(`${event.event_date}T00:00:00`).getDate()}</span>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                                        <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${urgency.badgeBg} ${urgency.badgeText} ${urgency.badgeBorder} ${urgency.pulse ? 'animate-pulse' : ''}`}>
                                                            {urgency.pulse && <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                                            </span>}
                                                            {urgency.label}
                                                        </span>
                                                    </div>
                                                    
                                                    <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                                                        <i className="fa-regular fa-clock opacity-70"></i>
                                                        {event.start_time || '8:00 AM'}
                                                    </p>
                                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-3">
                                                        <i className="fa-solid fa-location-dot opacity-70"></i>
                                                        {event.location || 'TBA'}
                                                    </p>
                                                    
                                                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                                                        <div 
                                                            className={`${urgency.spineColor} h-1.5 rounded-full`} 
                                                            style={{ width: `${Math.min(((event.rsvp_count || 0) / (event.capacity || 100)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="mt-1 text-[10px] font-bold text-slate-500 text-right">
                                                        {event.rsvp_count || 0} / {event.capacity || 100} going
                                                    </p>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}