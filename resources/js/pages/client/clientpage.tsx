import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' ;
    posted_by_office: string;
    date: string;
    content: string;
    content_html: string;
    image: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    is_pinned?: boolean;
    is_urgent?: boolean;
    is_new?: boolean;
}

interface ClientHomeProps {
    announcements?: Announcement[];
    upcomingEvents?: Announcement[];
    newAnnouncementCount?: number;
    isLoading?: boolean;
    hasError?: boolean;
    user?: {
        name: string;
        course: string;
        year_level: string;
    };
}

type SortOption = 'newest' | 'oldest' | 'az';

// ============ URGENCY HEATMAP LOGIC ============
type UrgencyLevel = 'urgent' | 'soon' | 'info' | 'good_news' | 'pinned' | 'default';

interface UrgencyTheme {
    level: UrgencyLevel;
    label: string;
    bannerColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    bgTint: string;
    pulse?: boolean;
}

function getUrgencyTheme(ann: Announcement): UrgencyTheme {
    const now = new Date();
    let eventStart: Date | null = null;
    
    if (ann.event_date) {
        const timeStr = ann.start_time || '00:00';
        eventStart = new Date(`${ann.event_date}T${timeStr}`);
    }

    const diffMs = eventStart ? eventStart.getTime() - now.getTime() : 0;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (ann.is_urgent) {
        return {
            level: 'urgent',
            label: 'Urgent',
            bannerColor: 'bg-red-600',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            badgeBorder: 'border-red-200',
            bgTint: 'bg-red-50',
            pulse: true,
        };
    }

    if (eventStart && diffHours > 0 && diffHours <= 24) {
        return {
            level: 'urgent',
            label: diffHours <= 1 ? 'Deadline < 1 hr' : `Starts in ${Math.round(diffHours)} hrs`,
            bannerColor: 'bg-red-600',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            badgeBorder: 'border-red-200',
            bgTint: 'bg-red-50',
            pulse: true,
        };
    }

    if (ann.is_pinned) {
        return {
            level: 'pinned',
            label: 'Pinned',
            bannerColor: 'bg-indigo-600',
            badgeBg: 'bg-indigo-100',
            badgeText: 'text-indigo-700',
            badgeBorder: 'border-indigo-200',
            bgTint: 'bg-indigo-50',
        };
    }

    if (eventStart && diffHours > 24 && diffHours <= 168) {
        const days = Math.ceil(diffHours / 24);
        return {
            level: 'soon',
            label: `Starts in ${days} days`,
            bannerColor: 'bg-amber-500',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-700',
            badgeBorder: 'border-amber-200',
            bgTint: 'bg-amber-50',
        };
    }

    const titleLower = ann.title.toLowerCase();
    const contentLower = ann.content.toLowerCase();
    const goodNewsKeywords = ['dean', 'award', 'achieve', 'winner', 'honor', 'congrat', 'success', 'top', 'passed', 'excellence', 'champion'];
    const isGoodNews = goodNewsKeywords.some(k => titleLower.includes(k) || contentLower.includes(k));
    
    if (isGoodNews) {
        return {
            level: 'good_news',
            label: 'Good News',
            bannerColor: 'bg-emerald-500',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            badgeBorder: 'border-emerald-200',
            bgTint: 'bg-emerald-50',
        };
    }

    if (ann.category === 'Event' || ann.category === 'Academic') {
        return {
            level: 'info',
            label: ann.category === 'Event' ? 'Upcoming Event' : 'Academic Info',
            bannerColor: 'bg-blue-500',
            badgeBg: 'bg-blue-100',
            badgeText: 'text-blue-700',
            badgeBorder: 'border-blue-200',
            bgTint: 'bg-blue-50',
        };
    }

    return {
        level: 'default',
        label: 'Notice',
        bannerColor: 'bg-slate-400',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        bgTint: 'bg-white',
    };
}

export default function ClientHome({
    announcements = [],
    upcomingEvents = [],
    newAnnouncementCount = 0,
    isLoading = false,
    hasError = false,
    user = { name: 'Juan', course: 'BSIT', year_level: '3rd Year' },
}: ClientHomeProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const [activeFilter, setActiveFilter] = useState<
        'all' | 'Academic' | 'Event' | 'General' 
    >('all');

    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // State for Hero Auto Carousel
    const [heroIndex, setHeroIndex] = useState(0);
    const [isHeroHovered, setIsHeroHovered] = useState(false);

    useEffect(() => {
        const intervalId = window.setInterval(() => setCurrentTime(new Date()), 60_000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const pollForAnnouncements = () => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: ['announcements', 'upcomingEvents', 'unreadCount'],
                    showProgress: false,
                });
            }
        };
        const intervalId = window.setInterval(pollForAnnouncements, 15_000);

        document.addEventListener('visibilitychange', pollForAnnouncements);
        window.addEventListener('focus', pollForAnnouncements);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', pollForAnnouncements);
            window.removeEventListener('focus', pollForAnnouncements);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.sort-dropdown-container')) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const filteredAnnouncements = useMemo(() => {
        let result = announcements.filter((announcement) => {
            return activeFilter === 'all' || announcement.category === activeFilter;
        });

        result = result.sort((a, b) => {
            if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1;
            if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            return 0;
        });

        return result;
    }, [activeFilter, announcements, sortBy]);

    const urgentAnnouncements = useMemo(() => {
        return filteredAnnouncements.filter(ann => getUrgencyTheme(ann).level === 'urgent');
    }, [filteredAnnouncements]);

    // In this layout, everything goes to the main feed below the hero
    const feedAnnouncements = useMemo(() => {
        return filteredAnnouncements.filter(ann => getUrgencyTheme(ann).level !== 'urgent');
    }, [filteredAnnouncements]);

    // Auto-carousel effect for Hero
    useEffect(() => {
        if (urgentAnnouncements.length <= 1 || isHeroHovered) return;

        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % urgentAnnouncements.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [urgentAnnouncements.length, isHeroHovered]);

    useEffect(() => {
        if (heroIndex >= urgentAnnouncements.length) {
            setHeroIndex(0);
        }
    }, [urgentAnnouncements.length, heroIndex]);

    const formatDate = (date: string) =>
        new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const formatTime = (time: string | null) =>
        time
            ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
              })
            : '';

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Academic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'General': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <>
            <Head title="Home | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes pulse-urgent { 
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 
                    50% { opacity: 0.9; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); } 
                }
                
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }
                @keyframes move-around-4 { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20vw, 30vh) scale(1.2); } 100% { transform: translate(0, 0) scale(1); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 25s linear infinite; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pulse-urgent { animation: pulse-urgent 2.5s ease-in-out infinite; }
                
                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }
                .shape-move-4 { animation: move-around-4 30s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] left-[5%] w-[30rem] h-[30rem] bg-blue-500/15 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-purple-500/15 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[40%] left-[30%] w-[25rem] h-[25rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-blue-600/20 clip-hexagon shape-move-3"></div>
                    <div className="absolute bottom-[15%] left-[10%] w-48 h-48 border-[6px] border-purple-500/30 clip-diamond animate-spin-slow"></div>
                    <div className="absolute top-[45%] right-[10%] w-40 h-40 border-[5px] border-blue-500/25 rotate-12 shape-move-1"></div>
                    <div className="absolute bottom-[20%] right-[40%] w-56 h-56 border-[8px] border-indigo-500/20 clip-hexagon shape-move-2 bg-transparent">
                        <div className="w-full h-full bg-blue-500/10 clip-hexagon scale-[0.95]"></div>
                    </div>
                </div>

                <ClientNavbar activePage="home" />

                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Home</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                            <ClientNotificationDropdown variant="light" />
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1400px] mx-auto animate-slide-up">
                            
                            {/* Greeting & Filters */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                        {greeting}, {userName.split(' ')[0]}
                                    </h1>
                                    <p className="mt-1 text-sm sm:text-base text-slate-500">
                                        {user.course} · {user.year_level} · <span className="text-blue-600 font-bold">{newAnnouncementCount} new announcements</span>
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                                        {['all', 'Academic', 'Event', 'General'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveFilter(tab as any)}
                                                className={`rounded-full border px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    activeFilter === tab
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {tab === 'all' ? 'All' : tab === 'Event' ? 'Events' : tab}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative shrink-0 sort-dropdown-container">
                                        <button 
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1"
                                        >
                                            Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'A-Z'} 
                                            <i className={`fa-solid fa-chevron-down text-[10px] ${isSortOpen ? 'rotate-180' : ''}`}></i>
                                        </button>
                                        {isSortOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-32 rounded-xl bg-white shadow-lg ring-1 ring-black/5 animate-fade-in z-30">
                                                <button onClick={() => { setSortBy('newest'); setIsSortOpen(false); }} className="block w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50">Newest First</button>
                                                <button onClick={() => { setSortBy('oldest'); setIsSortOpen(false); }} className="block w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50">Oldest First</button>
                                                <button onClick={() => { setSortBy('az'); setIsSortOpen(false); }} className="block w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50">Title (A-Z)</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
                                
                                {/* LEFT COLUMN: Announcements (Feed Style) */}
                                <div className="xl:col-span-3 space-y-6">
                                    
                                    {/* URGENT HERO CAROUSEL */}
                                    {urgentAnnouncements.length > 0 && (
                                        <div 
                                            className="relative w-full overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white group"
                                            onMouseEnter={() => setIsHeroHovered(true)}
                                            onMouseLeave={() => setIsHeroHovered(false)}
                                        >
                                            <div 
                                                className="flex transition-transform duration-500 ease-in-out h-full"
                                                style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                                            >
                                                {urgentAnnouncements.map((ann) => {
                                                    const urgency = getUrgencyTheme(ann);
                                                    return (
                                                        <div 
                                                            key={ann.id}
                                                            onClick={() => router.visit(`/client/announcements/${ann.id}`)}
                                                            className={`w-full shrink-0 flex flex-col md:flex-row cursor-pointer relative ${urgency.bgTint}`}
                                                        >
                                                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${urgency.bannerColor} ${urgency.pulse ? 'animate-pulse-urgent' : ''}`} />
                                                            
                                                            <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 md:w-1/2">
                                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${urgency.badgeBg} ${urgency.badgeText} ${urgency.badgeBorder} border ${urgency.pulse ? 'animate-pulse' : ''}`}>
                                                                        {urgency.label}
                                                                    </span>
                                                                    <span className={`rounded border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getCategoryColor(ann.category)}`}>
                                                                        {ann.category}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-slate-500 ml-auto">{formatDate(ann.date)}</span>
                                                                </div>
                                                                
                                                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
                                                                    {ann.title}
                                                                </h2>
                                                                <div 
                                                                    dangerouslySetInnerHTML={{ __html: ann.content_html }} 
                                                                    className="line-clamp-3 text-sm text-slate-600 mb-6 [&_p]:mb-0"
                                                                />
                                                                
                                                                <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px]">
                                                                        <i className="fa-solid fa-building"></i>
                                                                    </div>
                                                                    {ann.posted_by_office}
                                                                </div>
                                                            </div>

                                                            {ann.image && (
                                                                <div className="md:w-1/2 shrink-0 bg-slate-900 relative min-h-[250px] md:min-h-full overflow-hidden flex items-center justify-center">
                                                                    <img 
                                                                        src={ann.image} 
                                                                        alt="" 
                                                                        aria-hidden="true"
                                                                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/10" />
                                                                    
                                                                    <img 
                                                                        src={ann.image} 
                                                                        alt={ann.title} 
                                                                        className="relative z-10 max-h-[350px] w-auto max-w-full object-contain drop-shadow-2xl" 
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {urgentAnnouncements.length > 1 && (
                                                <>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev === 0 ? urgentAnnouncements.length - 1 : prev - 1)); }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                    >
                                                        <i className="fa-solid fa-chevron-left text-sm"></i>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev + 1) % urgentAnnouncements.length); }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                    >
                                                        <i className="fa-solid fa-chevron-right text-sm"></i>
                                                    </button>

                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                        {urgentAnnouncements.map((_, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => { e.stopPropagation(); setHeroIndex(idx); }}
                                                                className={`h-2 rounded-full transition-all ${idx === heroIndex ? 'w-6 bg-slate-800' : 'w-2 bg-slate-400/50 hover:bg-slate-400'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* STANDARD ANNOUNCEMENTS FEED (1 Column with Square Image) */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {feedAnnouncements.map((ann) => {
                                            const urgency = getUrgencyTheme(ann);
                                            return (
                                            <div
                                                key={ann.id}
                                                onClick={() => router.visit(`/client/announcements/${ann.id}`)}
                                                className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer group ${urgency.bgTint}`}
                                            >
                                                {/* Heatmap Top Border */}
                                                <div className={`h-1.5 w-full ${urgency.bannerColor} ${urgency.pulse ? 'animate-pulse-urgent' : ''}`} />

                                                {/* Social Header */}
                                                <div className="flex items-start justify-between p-4 pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
                                                            {ann.posted_by_office.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1">
                                                                <h4 className="text-sm font-bold text-slate-900 hover:underline">
                                                                    {ann.posted_by_office}
                                                                </h4>
                                                                <i className="fa-solid fa-circle-check text-[12px] text-blue-500" title="Verified"></i>
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                <span>{formatDate(ann.date)}</span>
                                                                <span>·</span>
                                                                <i className="fa-solid fa-globe text-[10px]"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${urgency.badgeBg} ${urgency.badgeText} border ${urgency.badgeBorder}`}>
                                                            {urgency.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Caption / Text Content */}
                                                <div className="px-4 pb-3">
                                                    <h3 className="text-[17px] font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
                                                        {ann.title}
                                                    </h3>
                                                    <div dangerouslySetInnerHTML={{ __html: ann.content_html }} className="text-[14px] text-slate-700 leading-relaxed line-clamp-3 [&_p]:mb-0" />
                                                </div>

                                                {/* SQUARE Image Container */}
                                                {ann.image && (
                                                    <div className="w-full aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center border-t border-slate-100">
                                                        {/* Blurred Background to fill empty space */}
                                                        <img 
                                                            src={ann.image} 
                                                            alt="" 
                                                            className="absolute inset-0 h-full w-full scale-110 object-cover blur-md opacity-50" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/10" />
                                                        
                                                        {/* Sharp Image */}
                                                        <img 
                                                            src={ann.image} 
                                                            alt={ann.title} 
                                                            className="relative z-10 h-full w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        )})}
                                    </div>

                                    {filteredAnnouncements.length === 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-800">No updates found</h3>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT COLUMN: Sidebar (Calendar / Events) */}
                                <div className="space-y-6 hidden xl:block">
                                    
                                    {/* Placeholder Calendar block */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center min-h-[200px]">
                                        <h3 className="text-xl font-extrabold text-slate-300 uppercase tracking-widest text-center">
                                            Calendar<br/>(Coming Soon)
                                        </h3>
                                    </div>

                                    {/* Upcoming Events */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h3 className="mb-4 text-lg font-extrabold text-slate-900">Upcoming Events</h3>
                                        <div className="space-y-4">
                                            {upcomingEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => router.visit(`/client/announcements/${event.id}`)}
                                                    className="flex cursor-pointer gap-3 group"
                                                >
                                                    <div className="h-fit min-w-[50px] shrink-0 rounded-lg bg-slate-100 p-2 text-center group-hover:bg-blue-50 transition-colors">
                                                        <p className="text-[9px] font-extrabold text-slate-500 uppercase">
                                                            {new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                                                        </p>
                                                        <p className="mt-0.5 text-lg leading-none font-black text-slate-800">
                                                            {new Date(`${event.event_date}T00:00:00`).getDate()}
                                                        </p>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="mb-1 line-clamp-2 text-sm leading-tight font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {event.title}
                                                        </h4>
                                                        <p className="text-[11px] font-semibold text-slate-500">
                                                            {formatTime(event.start_time)} · {event.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {upcomingEvents.length === 0 && (
                                                <p className="text-center text-sm text-slate-500 py-4">No upcoming events.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Starting Now / Urgent Events Box */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                         <h3 className="mb-4 text-lg font-extrabold text-slate-900">Starting Now</h3>
                                         <p className="text-sm font-medium text-slate-500">Check back later for live events.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}