import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by: string;
    date: string;
    content: string;
    image: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
}

interface ClientProps {
    announcements: Announcement[];
    userName?: string;
    isLoggedIn?: boolean;
}

export default function Client({ announcements, userName = 'Guest' }: ClientProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
    
    // CAROUSEL STATE
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [savedItems, setSavedItems] = useState<number[]>([]);

    // SCROLL ANIMATION STATE & REFS
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const announcementsRef = useRef<HTMLDivElement>(null);
    const eventsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkVisibility = () => {
            if (announcementsRef.current && !visibleSections.includes('announcements')) {
                const rect = announcementsRef.current.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    setVisibleSections(prev => [...prev, 'announcements']);
                }
            }
            if (eventsRef.current && !visibleSections.includes('events')) {
                const rect = eventsRef.current.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    setVisibleSections(prev => [...prev, 'events']);
                }
            }
        };

        window.addEventListener('scroll', checkVisibility);
        checkVisibility(); 

        return () => window.removeEventListener('scroll', checkVisibility);
    }, [visibleSections]);

    const handleSmoothScroll = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const featuredAnnouncements = announcements.slice(0, 3);
    const featuredAnnouncement = featuredAnnouncements[currentSlide];

    useEffect(() => {
        if (isHovered || featuredAnnouncements.length < 2) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredAnnouncements.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isHovered, featuredAnnouncements.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredAnnouncements.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? featuredAnnouncements.length - 1 : prev - 1));
    const toggleSaveFeatured = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedItems((prev) => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // MOCK DATA & FILTERING
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((a) => {
            const matchesCategory = activeFilter === 'all' || a.category === activeFilter;
            const matchesSearch =
                searchTerm === '' ||
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.posted_by.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeFilter, searchTerm]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        return announcements
            .filter((announcement) => announcement.category === 'Event' && announcement.event_date && announcement.event_date >= today)
            .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
            .slice(0, 3);
    }, [announcements]);

    const categoryCounts = [
        { name: 'Academic', icon: 'fa-graduation-cap', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', bg: 'from-blue-50 to-white border-blue-100' },
        { name: 'Event', icon: 'fa-calendar-check', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', bg: 'from-emerald-50 to-white border-emerald-100' },
        { name: 'General', icon: 'fa-bullhorn', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-700', bg: 'from-slate-50 to-white border-slate-200' },
        { name: 'Service', icon: 'fa-hand-holding-heart', color: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', bg: 'from-rose-50 to-white border-rose-100' },
    ].map((category) => ({
        ...category,
        count: announcements.filter((announcement) => announcement.category === category.name).length,
        name: category.name === 'Event' ? 'Events' : category.name,
    }));

    const getBadgeClass = (category: string): string => {
        switch (category) {
            case 'Academic': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Event': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Service': return 'bg-rose-100 text-rose-700 border border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const formatDate = (date: string): string => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formatTime = (time: string | null): string => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : 'Time TBA';

    const filterTabs = ['all', 'Academic', 'Event', 'General', 'Service'];

    return (
        <>
            <Head title="Clientpage" />
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes revealUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Exact moving shapes from Login/Register */
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
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }
                
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-reveal-up { animation: revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .hidden-section { opacity: 0; transform: translateY(60px); }
                
                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .shape-spin { animation: spin-slow 40s linear infinite; }
                .animate-pulse-soft { animation: pulse-soft 8s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen relative overflow-hidden">
                
                {/* ========================================= */}
                {/* EXACT MOVING SHAPES FROM LOGIN/REGISTER   */}
                {/* ========================================= */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Glowing soft orbs */}
                    <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-3xl shape-move-2"></div>

                    {/* Circles & Rings */}
                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[3px] border-blue-500/20 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[4px] border-blue-600/20 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-400/30 rounded-full shape-move-3"></div>

                    {/* Hexagons */}
                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/10 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[4px] border-blue-600/15 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>

                    {/* Octagons */}
                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-blue-600/10 clip-octagon shape-move-3"></div>
                    <div className="absolute bottom-[35%] right-[35%] w-48 h-48 border-[4px] border-blue-500/15 clip-octagon shape-move-1 bg-transparent">
                         <div className="w-full h-full bg-blue-500/5 clip-octagon scale-[0.95]"></div>
                    </div>

                    {/* Squares / Diamonds */}
                    <div className="absolute top-[70%] right-[10%] w-28 h-28 border-[3px] border-blue-500/20 rotate-45 shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[40%] w-16 h-16 bg-blue-600/15 rotate-12 shape-move-3"></div>

                    {/* Triangles */}
                    <div className="absolute top-[10%] right-[40%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-blue-500/15 shape-move-2"></div>
                    <div className="absolute bottom-[40%] left-[5%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[50px] border-t-blue-600/15 shape-move-1"></div>

                    {/* Abstract Lines */}
                    <div className="absolute top-[30%] right-[5%] w-3 h-48 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[25%] w-48 h-3 bg-gradient-to-r from-blue-600/20 to-transparent rounded-full shape-move-3"></div>
                    
                    {/* Large Torus & Extra Shapes */}
                    <div className="absolute top-[5%] right-[5%] w-64 h-64 border-[15px] border-blue-600/10 rounded-full shape-move-3"></div>
                    <div className="absolute bottom-[5%] right-[30%] w-24 h-24 bg-blue-500/15 clip-octagon shape-move-1"></div>
                    <div className="absolute top-[55%] left-[30%] w-20 h-20 border-[3px] border-blue-500/20 rotate-45 shape-move-2"></div>
                    <div className="absolute bottom-[25%] left-[15%] w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-blue-500/15 shape-move-3"></div>
                    <div className="absolute top-[85%] right-[10%] w-56 h-2 bg-gradient-to-r from-transparent via-blue-600/25 to-transparent rounded-full shape-move-1"></div>
                </div>

                {/* ========================================= */}
                {/* MAIN CONTENT (Z-10 so it sits above shapes) */}
                {/* ========================================= */}
                <div className="relative z-10">
                    
                    {/* GLASSMORPHISM HEADER */}
                    <header className="fixed top-0 left-0 right-0 z-40 bg-ctu-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-20">
                                <Link href="/client" className="flex items-center group">
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify Logo"
                                        className="w-30 h-30 object-contain -ml-3 -mr-6 group-hover:scale-105 transition-transform"
                                    />
                                    <div>
                                        <h1 className="font-extrabold text-white text-lg leading-tight tracking-tight">COTIFY</h1>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College of Technology</p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-4">
                                    <div className="relative hidden md:block group">
                                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-white transition-colors"></i>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search announcements..."
                                            className="w-64 lg:w-80 pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl text-sm focus:bg-slate-900 focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/20 outline-none transition-all placeholder-slate-400"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <button className="flex items-center gap-3 p-1 pr-3 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ctu-lightblue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-200 hidden sm:block">{userName}</span>
                                            <i className="fa-solid fa-chevron-down text-xs text-slate-400 hidden sm:block"></i>
                                        </button>

                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                            <div className="p-2">
                                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors">
                                                    <i className="fa-regular fa-user w-4 text-center"></i> My Profile
                                                </a>
                                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors">
                                                    <i className="fa-regular fa-bell w-4 text-center"></i> Notifications
                                                </a>
                                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors">
                                                    <i className="fa-solid fa-gear w-4 text-center"></i> Settings
                                                </a>
                                                <hr className="my-2 border-slate-100" />
                                                <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Log Out
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <i className={`fa-solid ${mobileNavOpen ? 'fa-times' : 'fa-bars'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {mobileNavOpen && (
                            <div className="lg:hidden bg-ctu-dark border-t border-slate-800 px-4 py-4 absolute w-full shadow-2xl animate-fade-in">
                                <div className="relative">
                                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search announcements..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </header>

                    {/* HERO SECTION */}
                    <section className="relative pt-20 bg-ctu-dark overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="University Campus" className="w-full h-full object-cover opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-b from-ctu-dark/50 via-ctu-dark/80 to-ctu-dark"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-ctu-lightblue animate-pulse"></span>
                                    Welcome to COTIFY
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                                    Stay Updated with<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctu-lightblue to-blue-400">Campus Announcements</span>
                                </h1>
                                <p className="text-slate-300 text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed font-medium">
                                    Your one-stop portal for the latest news, events, and important updates from the College of Technology.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button 
                                        onClick={() => handleSmoothScroll('announcements')} 
                                        className="bg-ctu-lightblue hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.8)] hover:-translate-y-1"
                                    >
                                        <i className="fa-solid fa-bullhorn"></i> Browse Announcements
                                    </button>
                                    <button 
                                        onClick={() => handleSmoothScroll('events')} 
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:-translate-y-1"
                                    >
                                        <i className="fa-regular fa-calendar"></i> Upcoming Events
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FLOATING STATS BAR */}
                    <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-16">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
                            <div className="flex-1 p-6 text-center bg-gradient-to-br from-blue-50/80 to-white hover:from-blue-100 transition-colors rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none">
                                <p className="text-4xl font-extrabold text-blue-600">{announcements.length}</p>
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mt-1">Announcements</p>
                            </div>
                            <div className="flex-1 p-6 text-center bg-gradient-to-br from-emerald-50/80 to-white hover:from-emerald-100 transition-colors rounded-b-3xl sm:rounded-r-3xl sm:rounded-bl-none">
                                <p className="text-4xl font-extrabold text-emerald-600">{upcomingEvents.length}</p>
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mt-1">Upcoming Events</p>
                            </div>
                        </div>
                    </div>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* LEFT COLUMN: Main Feed */}
                            <div className="lg:col-span-8 space-y-10">
                                
                                {/* FEATURED CAROUSEL */}
                                {featuredAnnouncement && (
                                <div 
                                    className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl group bg-slate-900 border border-slate-800"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={featuredAnnouncement.image ?? '/images/download.jpg'}
                                            alt="Featured"
                                            className="w-full h-[400px] sm:h-[480px] object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                    </div>

                                    <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 text-white h-[400px] sm:h-[480px]">
                                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                                            <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-ctu-lightblue text-white shadow-lg shadow-ctu-lightblue/40 backdrop-blur-md">
                                                Featured • {featuredAnnouncement.category}
                                            </span>
                                            
                                            <button 
                                                onClick={(e) => toggleSaveFeatured(featuredAnnouncement.id, e)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border ${
                                                    savedItems.includes(featuredAnnouncement.id)
                                                        ? 'bg-red-500/90 border-red-400 text-white shadow-lg shadow-red-500/40 scale-110'
                                                        : 'bg-white/10 border-white/20 hover:bg-white/30 text-white'
                                                }`}
                                            >
                                                <i className={`fa-${savedItems.includes(featuredAnnouncement.id) ? 'solid' : 'regular'} fa-heart text-lg transition-transform duration-300 ${
                                                    savedItems.includes(featuredAnnouncement.id) ? 'animate-pulse' : ''
                                                }`}></i>
                                            </button>
                                        </div>

                                        <div key={featuredAnnouncement.id} className="animate-slide-up max-w-2xl">
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10"><i className="fa-regular fa-calendar"></i> {formatDate(featuredAnnouncement.date)}</span>
                                                {featuredAnnouncement.location && (
                                                    <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10"><i className="fa-solid fa-location-dot"></i> {featuredAnnouncement.location}</span>
                                                )}
                                            </div>
                                            
                                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-[1.2]">
                                                {featuredAnnouncement.title}
                                            </h2>
                                            
                                            <p className="text-slate-300 text-base mb-8 leading-relaxed line-clamp-2 font-medium">
                                                {featuredAnnouncement.content}
                                            </p>
                                            
                                            <Link 
                                                href={`/announcement/${featuredAnnouncement.id}`}
                                                className="bg-white text-slate-900 hover:bg-blue-50 font-extrabold py-3 px-8 rounded-xl transition-all shadow-xl inline-flex items-center gap-2 text-sm hover:-translate-y-1"
                                            >
                                                Read Details <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>

                                    {featuredAnnouncements.length > 1 && (
                                        <>
                                            <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>
                                            <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </>
                                    )}

                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                                        {featuredAnnouncements.map((announcement, index) => (
                                            <button
                                                key={announcement.id}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    currentSlide === index ? 'w-8 bg-ctu-lightblue' : 'w-2 bg-white/40 hover:bg-white/80'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                )}

                                {/* ANNOUNCEMENTS FEED */}
                                <div 
                                    id="announcements" 
                                    ref={announcementsRef}
                                    className={`scroll-mt-28 transition-all duration-1000 ${visibleSections.includes('announcements') ? 'animate-reveal-up' : 'hidden-section'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Latest Updates</h2>
                                            <p className="text-slate-500 mt-1 font-medium">Stay informed with what's happening on campus</p>
                                        </div>
                                        <Link
                                            href="/all-announcements"
                                            className="text-sm font-bold text-ctu-lightblue bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            View All <i className="fa-solid fa-arrow-right text-xs"></i>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                                        {filterTabs.map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveFilter(tab)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                    activeFilter === tab
                                                        ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/30'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                            >
                                                {tab === 'all' ? 'All Updates' : tab === 'Event' ? 'Events' : tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        {filteredAnnouncements.map((ann) => (
                                            <article key={ann.id} className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-3 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-ctu-lightblue/40 transition-all duration-300 group flex flex-col sm:flex-row gap-6">
                                                <div className="sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden rounded-2xl relative">
                                                    <img src={ann.image ?? '/images/download.jpg'} alt={ann.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                </div>
                                                <div className="flex-1 py-2 pr-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${getBadgeClass(ann.category)}`}>
                                                                {ann.category}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-400"><i className="fa-regular fa-clock mr-1"></i> {formatDate(ann.date)}</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-ctu-lightblue transition-colors">
                                                            {ann.title}
                                                        </h3>
                                                        <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                                <i className="fa-solid fa-building text-xs"></i>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700">{ann.posted_by}</span>
                                                        </div>
                                                        <Link
                                                            href={`/client/announcements/${ann.id}`}
                                                            className="text-ctu-lightblue bg-blue-50 hover:bg-ctu-lightblue hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                                        >
                                                            Read More <i className="fa-solid fa-arrow-right"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    {filteredAnnouncements.length === 0 && (
                                        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <i className="fa-solid fa-magnifying-glass text-slate-300 text-3xl"></i>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">No announcements found</h3>
                                            <p className="text-slate-500 font-medium">
                                                {announcements.length === 0
                                                    ? 'There are no announcements yet.'
                                                    : "Try adjusting your search or filter to find what you're looking for."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Sidebar */}
                            <aside className="lg:col-span-4 space-y-8">
                                
                                {/* EVENTS WIDGET */}
                                <div 
                                    id="events" 
                                    ref={eventsRef}
                                    className={`bg-gradient-to-b from-emerald-50/90 to-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-sm overflow-hidden scroll-mt-28 transition-all duration-1000 ${visibleSections.includes('events') ? 'animate-reveal-up' : 'hidden-section'}`}
                                >
                                    <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between bg-white/50">
                                        <h3 className="font-extrabold text-emerald-900 flex items-center gap-2">
                                            <i className="fa-regular fa-calendar text-emerald-600"></i> Upcoming Events
                                        </h3>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {upcomingEvents.map((event) => (
                                            <div key={event.id} className="flex items-start gap-4 p-3 rounded-2xl bg-white hover:bg-emerald-50/50 transition-colors border border-emerald-100/50 hover:border-emerald-200 shadow-sm group">
                                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-2.5 text-center min-w-[60px] shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                                                    <p className="text-[10px] font-extrabold uppercase tracking-widest">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                    <p className="text-xl font-black leading-none mt-0.5">{new Date(`${event.event_date}T00:00:00`).getDate()}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-emerald-600 transition-colors">{event.title}</h4>
                                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                                                        <i className="fa-regular fa-clock text-slate-400"></i>
                                                        {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-slate-400"></i> {event.location}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {upcomingEvents.length === 0 && (
                                            <p className="text-sm font-medium text-slate-500 text-center py-6">No upcoming events.</p>
                                        )}
                                    </div>
                                </div>

                                {/* CATEGORIES WIDGET */}
                                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-tags text-ctu-lightblue"></i> Categories
                                        </h3>
                                    </div>
                                    <div className="p-3">
                                        {categoryCounts.map((cat) => (
                                            <a key={cat.name} href="#" className={`flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r ${cat.bg} border hover:shadow-md transition-all group mb-2`}>
                                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm ${cat.color}`}>
                                                        <i className={`fa-solid ${cat.icon} text-sm`}></i>
                                                    </div> 
                                                    {cat.name}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-lg font-extrabold bg-white ${cat.color} shadow-sm`}>{cat.count}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* NEWSLETTER WIDGET - DARK COTIFY THEME */}
                                <div className="bg-ctu-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-ctu-lightblue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10">
                                            <i className="fa-regular fa-envelope text-white text-xl"></i>
                                        </div>
                                        <h3 className="font-extrabold text-xl mb-3">Newsletter</h3>
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed mb-6">
                                            Get the latest announcements, events, and important updates straight to your inbox.
                                        </p>
                                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                            <input 
                                                type="email" 
                                                placeholder="Your email address" 
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder-slate-400 focus:bg-white/10 focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/20 outline-none transition-all" 
                                            />
                                            <button 
                                                type="submit" 
                                                className="w-full bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-ctu-lightblue/20 hover:-translate-y-0.5"
                                            >
                                                Subscribe
                                            </button>
                                        </form>
                                    </div>
                                </div>

                            </aside>
                        </div>
                    </main>

                    {/* MODERN FOOTER */}
                    <footer className="bg-ctu-dark text-white mt-10 border-t border-slate-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                                <div className="md:col-span-2">
                                    <div className="flex items-center mb-6">
                                        <img
                                            src="/images/3rdLogo.png"
                                            alt="Cotify Logo"
                                            className="w-30 h-30 object-contain -ml-3 -mr-6 group-hover:scale-105 transition-transform"
                                        />
                                        <div>
                                            <h1 className="font-extrabold text-white text-lg leading-tight tracking-tight">COTIFY</h1>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College of Technology</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-md">
                                        The official announcement and event management portal of the College of Technology. Stay informed, stay connected.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Quick Links</h4>
                                    <ul className="space-y-3 text-sm font-medium text-slate-400">
                                        <li><Link href="/client" className="hover:text-ctu-lightblue transition-colors">Home</Link></li>
                                        <li><a href="#announcements" className="hover:text-ctu-lightblue transition-colors">Announcements</a></li>
                                        <li><a href="#events" className="hover:text-ctu-lightblue transition-colors">Events</a></li>
                                        <li><a href="#about" className="hover:text-ctu-lightblue transition-colors">About</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Contact</h4>
                                    <ul className="space-y-3 text-sm font-medium text-slate-400">
                                        <li className="flex items-center gap-3"><i className="fa-solid fa-location-dot w-4 text-ctu-lightblue"></i> Cotify City, Cebu</li>
                                        <li className="flex items-center gap-3"><i className="fa-regular fa-envelope w-4 text-ctu-lightblue"></i> info@cotify.edu.ph</li>
                                        <li className="flex items-center gap-3"><i className="fa-solid fa-phone w-4 text-ctu-lightblue"></i> (032) 123-4567</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <p className="text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                                <div className="flex items-center gap-3">
                                    <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-ctu-lightblue transition-all"><i className="fa-brands fa-facebook-f"></i></a>
                                    <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-ctu-lightblue transition-all"><i className="fa-brands fa-twitter"></i></a>
                                    <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-ctu-lightblue transition-all"><i className="fa-brands fa-instagram"></i></a>
                                    <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-ctu-lightblue transition-all"><i className="fa-brands fa-youtube"></i></a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}