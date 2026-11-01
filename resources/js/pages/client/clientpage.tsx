import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by_office: string;
    date: string;
    content: string;
    image: string | null;
    is_new: boolean;
    is_pinned: boolean;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
}

interface ClientHomeProps {
    announcements?: Announcement[];
    unreadCount?: number;
    isLoading?: boolean;
    hasError?: boolean;
    user?: {
        name: string;
        course: string;
        year_level: string;
    };
}

export default function ClientHome({
    announcements = [],
    unreadCount = 0,
    isLoading = false,
    hasError = false,
    user = { name: 'Juan', course: 'BSIT', year_level: '3rd Year' }
}: ClientHomeProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;
    
    const [activeFilter, setActiveFilter] = useState<'all' | 'Academic' | 'Event' | 'General' | 'Service'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [rsvpEvents, setRsvpEvents] = useState<number[]>([]);

    const handleRsvp = (id: number) => {
        setRsvpEvents(prev => 
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    // Filtering Logic
    const filteredAnnouncements = announcements.filter((ann) => {
        const matchesFilter = activeFilter === 'all' || ann.category === activeFilter;
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ann.posted_by_office.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
    const standardAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

    const upcomingEvents = announcements
        .filter(a => a.category === 'Event' && a.event_date)
        .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
        .slice(0, 2); // Showing next 2 events as per mockup

    const savedAnnouncements = announcements.filter(a => a.is_new).slice(0, 2); // Mock saved data

    const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const formatTime = (time: string | null) => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : '';

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'Academic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <>
            <Head title="Home | COTIFY" />

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">
                
                {/* ========================================= */}
                {/* KEPT: MOVING SHAPES BACKGROUND              */}
                {/* ========================================= */}
                <style>{`
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
                    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                    .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                    .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                    .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                    .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                    .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                    .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                    .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
                `}</style>

                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/10 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/10 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                </div>

                {/* ==================== */}
                {/* 1. TOP NAVIGATION    */}
                {/* ==================== */}
                <header className="relative z-50 bg-ctu-dark/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                            
                            <div className="flex items-center gap-8">
                                <Link href="/client" className="flex items-center shrink-0">
                                    <img src="/images/3rdLogo.png" alt="Cotify" className="w-10 h-10 sm:w-12 sm:h-12 object-contain -ml-1 -mr-3" />
                                    <span className="font-extrabold text-xl text-white hidden sm:block">Cotify</span>
                                </Link>

                                <nav className="hidden md:flex items-center gap-6">
                                    <Link href="/client" className="text-sm font-bold text-white border-b-2 border-ctu-lightblue pb-1">Home</Link>
                                    <Link href="/announcements" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Announcements</Link>
                                    <Link href="/events" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Events</Link>
                                    <Link href="/saved" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Saved</Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative hidden sm:block">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Search announcements..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-ctu-lightblue outline-none w-64 transition-all"
                                    />
                                </div>

                                <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-300 transition-colors">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-ctu-dark">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-700 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-ctu-lightblue text-white flex items-center justify-center font-bold text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-white hidden lg:block">{userName.split(' ')[0]} D.</span>
                                    <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    
                    {/* 2. GREETING + SUMMARY */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Good morning, {userName.split(' ')[0]}</h1>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">
                            {user.course} · {user.year_level} · <span className="font-bold text-ctu-lightblue">{unreadCount} new announcements</span> since your last visit · 1 event this week
                        </p>
                    </div>

                    {/* 3. URGENT/PINNED STRIP */}
                    {pinnedAnnouncements.length > 0 && (
                        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase px-2 py-1 rounded border border-rose-200">Urgent</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                    <i className="fa-solid fa-thumbtack"></i> Pinned
                                </span>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{pinnedAnnouncements[0].title}</h3>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-xs text-slate-500">{pinnedAnnouncements[0].posted_by_office} · 2h ago</span>
                                <Link href={`/client/announcements/${pinnedAnnouncements[0].id}`} className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Read
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* LEFT COLUMN: FEED */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* 4. FILTER CHIPS */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {['all', 'Academic', 'Event', 'General', 'Service'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab as any)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                                activeFilter === tab
                                                    ? 'bg-ctu-lightblue text-white border-ctu-lightblue shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {tab === 'all' ? 'All' : tab === 'Event' ? 'Events' : tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs font-semibold text-slate-500 shrink-0">
                                    Sort: Newest <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 flex gap-4">
                                            <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
                                            <div className="flex-1 space-y-3 py-1">
                                                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasError && !isLoading && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                                    <h3 className="text-lg font-bold text-red-800">Unable to load announcements</h3>
                                    <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold">Retry</button>
                                </div>
                            )}

                            {!isLoading && !hasError && (
                                <div className="space-y-4">
                                    
                                    {/* 5. ONE CARD STYLE PER ANNOUNCEMENT */}
                                    {standardAnnouncements.map((ann) => (
                                        <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-5">
                                            
                                            {/* Image / Placeholder */}
                                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                                                {ann.image ? (
                                                    <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <i className="fa-regular fa-newspaper text-3xl text-slate-300"></i>
                                                )}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        {ann.is_new && (
                                                            <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${getCategoryColor(ann.category)}`}>
                                                            {ann.category === 'Event' ? 'Events' : ann.category === 'Academic' ? 'Academic' : 'Services'}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400">Oct 30, 2026</span>
                                                    </div>
                                                    
                                                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1 hover:text-ctu-lightblue transition-colors cursor-pointer">
                                                        {ann.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{ann.content}</p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                                                            <i className="fa-solid fa-building"></i>
                                                        </div>
                                                        {ann.posted_by_office}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <button className="text-slate-400 hover:text-rose-500 transition-colors" aria-label="Save">
                                                            <i className="fa-regular fa-bookmark"></i> <span className="text-xs font-semibold ml-1">Save</span>
                                                        </button>
                                                        <Link href={`/client/announcements/${ann.id}`} className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                                            Read more
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredAnnouncements.length === 0 && (
                                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <i className="fa-regular fa-folder-open text-2xl text-slate-300"></i>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">No updates found</h3>
                                        </div>
                                    )}
                                    
                                    {/* Load More */}
                                    {filteredAnnouncements.length > 0 && (
                                        <div className="pt-2 text-center">
                                            <button className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                                Load more
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <aside className="lg:col-span-4 space-y-6">
                            
                            {/* 6. EVENTS PANEL */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-extrabold text-slate-900 text-sm">Upcoming events</h3>
                                    <Link href="/events" className="text-xs font-bold text-slate-500 hover:text-ctu-lightblue">View all</Link>
                                </div>
                                
                                <div className="p-4 space-y-4">
                                    {/* Mini Calendar Mockup */}
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase text-center px-1">
                                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600">
                                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => (
                                            <div key={d} className={`py-1 rounded cursor-pointer hover:bg-slate-100 ${d === 7 || d === 14 ? 'bg-ctu-lightblue/10 text-ctu-lightblue rounded-full' : ''}`}>
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="w-full h-px bg-slate-100 my-2"></div>

                                    {/* Event List */}
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[50px] shrink-0 h-fit">
                                                <p className="text-[9px] font-extrabold uppercase text-slate-500">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                <p className="text-lg font-black leading-none mt-0.5 text-slate-800">{new Date(`${event.event_date}T00:00:00`).getDate()}</p>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1 line-clamp-1">{event.title}</h4>
                                                <p className="text-[11px] font-semibold text-slate-500">
                                                    {formatTime(event.start_time)} · {event.location}
                                                </p>
                                                <button 
                                                    onClick={() => handleRsvp(event.id)}
                                                    className={`mt-2 px-3 py-1 rounded border text-xs font-bold transition-all ${
                                                        rsvpEvents.includes(event.id)
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                                                    }`}
                                                >
                                                    {rsvpEvents.includes(event.id) ? "I'm going" : "I'm going"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 7. SAVED SHORTCUT */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-extrabold text-slate-900 text-sm">Saved ({savedAnnouncements.length})</h3>
                                    <Link href="/saved" className="text-xs font-bold text-slate-500 hover:text-ctu-lightblue">View all</Link>
                                </div>
                                <div className="p-4 space-y-3">
                                    {savedAnnouncements.map(saved => (
                                        <div key={saved.id} className="group cursor-pointer">
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-ctu-lightblue transition-colors line-clamp-1">{saved.title}</p>
                                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 line-clamp-1">{saved.posted_by_office}</p>
                                        </div>
                                    ))}
                                    {savedAnnouncements.length === 0 && (
                                        <p className="text-xs text-slate-500">No saved items yet.</p>
                                    )}
                                </div>
                            </div>

                        </aside>

                    </div>
                </main>

                {/* ==================== */}
                {/* FOOTER               */}
                {/* ==================== */}
                <footer className="relative z-10 bg-ctu-dark text-white border-t border-slate-800 py-6 mt-auto">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">&copy; 2026 Cotify · College of Technology</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                            <span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}