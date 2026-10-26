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

interface Comment {
    id: number;
    author: string;
    role: string;
    avatarColor: string;
    text: string;
    time: string;
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
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    
    // ==========================================
    // CAROUSEL STATE
    // ==========================================
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [savedItems, setSavedItems] = useState<number[]>([]);

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

    // ==========================================
    // DISCUSSION STATE
    // ==========================================
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            author: 'Maria Santos',
            role: 'Student',
            avatarColor: 'bg-purple-500',
            text: 'Is there a specific dress code for this event?',
            time: '2 hours ago'
        },
        {
            id: 2,
            author: 'Admin Office',
            role: 'Organizer',
            avatarColor: 'bg-blue-600',
            text: 'Hi Maria! Smart casual attire is recommended. Please avoid wearing slippers.',
            time: '1 hour ago'
        }
    ]);
    const [newComment, setNewComment] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedAnnouncement) scrollToBottom();
    }, [comments, selectedAnnouncement]);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentToAdd: Comment = {
            id: Date.now(),
            author: 'You',
            role: 'Student',
            avatarColor: 'bg-emerald-500',
            text: newComment.trim(),
            time: 'Just now'
        };

        setComments([...comments, commentToAdd]);
        setNewComment('');
        
        setTimeout(() => {
            setComments(prev => [...prev, {
                id: Date.now() + 1,
                author: 'Admin Office',
                role: 'Organizer',
                avatarColor: 'bg-blue-600',
                text: 'Thanks for the question! We will update the main post shortly with more details.',
                time: 'Just now'
            }]);
        }, 2000);
    };

    const maxChars = 250;

    // ==========================================
    // MOCK DATA & FILTERING
    // ==========================================
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
        { name: 'Academic', icon: 'fa-graduation-cap', color: 'text-ctu-lightblue', badge: 'bg-blue-100 text-blue-700' },
        { name: 'Event', icon: 'fa-calendar-check', color: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
        { name: 'General', icon: 'fa-bullhorn', color: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' },
        { name: 'Service', icon: 'fa-hand-holding-heart', color: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
    ].map((category) => ({
        ...category,
        count: announcements.filter((announcement) => announcement.category === category.name).length,
        name: category.name === 'Event' ? 'Events' : category.name,
    }));

    const getBadgeClass = (category: string): string => {
        switch (category) {
            case 'Academic': return 'bg-blue-100 text-blue-700';
            case 'Event': return 'bg-emerald-100 text-emerald-700';
            case 'Service': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
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
            
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen">

                {/* CHANGED: Header background to match sidebar (bg-ctu-dark) */}
                <header className="fixed top-0 left-0 right-0 z-40 bg-ctu-dark border-b border-slate-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Link href="/client" className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
                                    <i className="fa-solid fa-gear text-ctu-dark text-lg"></i>
                                </div>
                                <div>
                                    {/* CHANGED: Text colors to white/slate for dark header */}
                                    <h1 className="font-bold text-white text-sm leading-tight">COTIFY</h1>
                                    <p className="text-[10px] text-slate-400">College of Technology</p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-3">
                                {/* CHANGED: Search input dark theme */}
                                <div className="relative hidden md:block group">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-white transition-colors"></i>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search announcements..."
                                        className="w-48 lg:w-64 pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs focus:bg-slate-900 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400"
                                    />
                                </div>

                                {/* CHANGED: Profile section text colors */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-ctu-lightblue flex items-center justify-center text-white text-xs font-semibold">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-200 hidden sm:block">{userName}</span>
                                        <i className="fa-solid fa-chevron-down text-xs text-slate-400 hidden sm:block"></i>
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="p-2">
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-regular fa-user w-4 text-center text-slate-400"></i> My Profile
                                            </a>
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-regular fa-bell w-4 text-center text-slate-400"></i> Notifications
                                            </a>
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-solid fa-gear w-4 text-center text-slate-400"></i> Settings
                                            </a>
                                            <hr className="my-1 border-slate-100" />
                                            <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                    className="lg:hidden text-slate-300 hover:text-white text-xl transition-colors"
                                >
                                    <i className={`fa-solid ${mobileNavOpen ? 'fa-times' : 'fa-bars'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {mobileNavOpen && (
                        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2 animate-fade-in">
                            <div className="relative mt-2">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search announcements..."
                                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:bg-slate-900 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400"
                                />
                            </div>
                        </div>
                    )}
                </header>

                <section className="relative pt-16">
                    <div className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="University Campus" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-ctu-dark via-ctu-dark/90 to-ctu-dark/50"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="max-w-2xl">
                                <p className="text-ctu-lightblue font-semibold tracking-widest text-xs uppercase mb-3">Welcome to COTIFY</p>
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                                    Stay Updated with<br />
                                    <span className="text-blue-400">Campus Announcements</span>
                                </h1>
                                <p className="text-slate-300 text-base lg:text-lg mb-8 max-w-xl">
                                    Your one-stop portal for the latest news, events, and important updates from the College of Technology.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <a href="#announcements" className="bg-ctu-lightblue hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30">
                                        <i className="fa-solid fa-bullhorn"></i> Browse Announcements
                                    </a>
                                    <a href="#events" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                        <i className="fa-regular fa-calendar"></i> Upcoming Events
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">{announcements.length}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Announcements</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">{upcomingEvents.length}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Upcoming Events</p>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2">
                            
                            {/* ========================================== */}
                            {/* FEATURED CAROUSEL                          */}
                            {/* ========================================== */}
                            {featuredAnnouncement && (
                            <div 
                                className="relative w-full rounded-3xl overflow-hidden shadow-2xl group bg-slate-900 mb-10"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={featuredAnnouncement.image ?? '/images/download.jpg'}
                                        alt="Featured"
                                        className="w-full h-[350px] sm:h-[400px] object-cover opacity-60 transition-opacity duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                {/* Content Wrapper */}
                                <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 text-white h-[350px] sm:h-[400px]">
                                    
                                    {/* Top Bar: Category & Save Button */}
                                    <div className="absolute top-5 left-5 right-5 flex justify-between items-center">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white shadow-lg shadow-blue-500/30 backdrop-blur-sm">
                                            Featured • {featuredAnnouncement.category}
                                        </span>
                                        
                                        <button 
                                            onClick={(e) => toggleSaveFeatured(featuredAnnouncement.id, e)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
                                                savedItems.includes(featuredAnnouncement.id)
                                                    ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/40 scale-110'
                                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                            }`}
                                            title="RSVP / Save this announcement"
                                        >
                                            <i className={`fa-${savedItems.includes(featuredAnnouncement.id) ? 'solid' : 'regular'} fa-heart text-base transition-transform duration-300 ${
                                                savedItems.includes(featuredAnnouncement.id) ? 'animate-pulse' : ''
                                            }`}></i>
                                        </button>
                                    </div>

                                    {/* Text Content */}
                                    <div key={featuredAnnouncement.id} className="animate-slide-up">
                                        <div className="flex items-center gap-4 text-xs text-slate-300 mb-2">
                                            <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar"></i> {formatDate(featuredAnnouncement.date)}</span>
                                            {featuredAnnouncement.location && (
                                                <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {featuredAnnouncement.location}</span>
                                            )}
                                        </div>
                                        
                                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight max-w-2xl">
                                            {featuredAnnouncement.title}
                                        </h2>
                                        
                                        <p className="text-slate-300 text-sm mb-6 max-w-xl leading-relaxed line-clamp-2">
                                            {featuredAnnouncement.content}
                                        </p>
                                        
                                        <button 
                                            onClick={() => setSelectedAnnouncement(featuredAnnouncement)}
                                            className="bg-white text-slate-900 hover:bg-blue-50 font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-0.5"
                                        >
                                            Read Details <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Arrows */}
                                {featuredAnnouncements.length > 1 && (
                                    <>
                                        <button onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                            <i className="fa-solid fa-chevron-left text-sm"></i>
                                        </button>
                                        <button onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                            <i className="fa-solid fa-chevron-right text-sm"></i>
                                        </button>
                                    </>
                                )}

                                {/* Dots */}
                                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
                                    {featuredAnnouncements.map((announcement, index) => (
                                        <button
                                            key={announcement.id}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                currentSlide === index ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/50 hover:bg-white/80'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* ========================================== */}
                            {/* ANNOUNCEMENTS FEED                         */}
                            {/* ========================================== */}
                            <div id="announcements" className="scroll-mt-20">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Latest Announcements</h2>
                                        <p className="text-sm text-slate-500">Stay informed with what's happening on campus</p>
                                    </div>
                                    <a href="#" className="text-sm text-ctu-lightblue hover:underline font-medium flex items-center gap-1">
                                        View All <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                </div>

                                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
                                    {filterTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                                activeFilter === tab
                                                    ? 'bg-ctu-lightblue text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {tab === 'all' ? 'All' : tab === 'Event' ? 'Events' : tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {filteredAnnouncements.map((ann) => (
                                        <article key={ann.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                                                    <img src={ann.image ?? '/images/download.jpg'} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 p-5 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getBadgeClass(ann.category)}`}>
                                                                {ann.category}
                                                            </span>
                                                            <span className="text-xs text-slate-400">{formatDate(ann.date)}</span>
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-ctu-lightblue transition-colors">
                                                            {ann.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                                <i className="fa-solid fa-building text-[10px]"></i>
                                                            </div>
                                                            <span className="text-xs text-slate-500 font-medium">{ann.posted_by}</span>
                                                        </div>
                                                        <button onClick={() => setSelectedAnnouncement(ann)} className="text-xs text-ctu-lightblue hover:underline font-medium flex items-center gap-1">
                                                            Read More <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {filteredAnnouncements.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-solid fa-magnifying-glass text-slate-400 text-xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 mb-1">No announcements found</h3>
                                        <p className="text-sm text-slate-500">
                                            {announcements.length === 0
                                                ? 'There are no announcements yet.'
                                                : "Try adjusting your search or filter to find what you're looking for."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-6">
                            <div id="events" className="bg-white rounded-2xl border border-slate-200 overflow-hidden scroll-mt-20">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <i className="fa-regular fa-calendar text-ctu-lightblue"></i> Upcoming Events
                                    </h3>
                                    <a href="#" className="text-xs text-ctu-lightblue hover:underline">View All</a>
                                </div>
                                <div className="p-4 space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <div key={event.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div className="bg-ctu-lightblue text-white rounded-lg p-2 text-center min-w-[50px] shrink-0">
                                                <p className="text-[10px] font-bold uppercase">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</p>
                                                <p className="text-lg font-bold leading-none">{new Date(`${event.event_date}T00:00:00`).getDate()}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1">{event.title}</h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <i className="fa-regular fa-clock"></i>
                                                    {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
                                                </p>
                                                {event.location && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><i className="fa-solid fa-location-dot"></i> {event.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingEvents.length === 0 && (
                                        <p className="text-sm text-slate-500 text-center py-3">No upcoming events.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <i className="fa-solid fa-tags text-ctu-lightblue"></i> Categories
                                    </h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    {categoryCounts.map((cat) => (
                                        <a key={cat.name} href="#" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                            <span className="text-sm text-slate-600 flex items-center gap-3">
                                                <i className={`fa-solid ${cat.icon} ${cat.color} w-4 text-center`}></i> {cat.name}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.badge}`}>{cat.count}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div id="about" className="bg-ctu-dark rounded-2xl p-6 text-white relative overflow-hidden scroll-mt-20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ctu-lightblue/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-gear text-white text-lg"></i>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">About COTIFY</h3>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                        COTIFY is the official announcement and event management system for the College of Technology. Stay connected with your campus community.
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-2 text-sm text-ctu-lightblue hover:text-white font-medium transition-colors">
                                        Learn More <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
                                    <i className="fa-regular fa-envelope text-ctu-lightblue"></i> Subscribe to Updates
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">Get the latest announcements straight to your inbox.</p>
                                <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                                    <input type="email" placeholder="Your email address" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                    <button type="submit" className="w-full bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">Subscribe</button>
                                </form>
                            </div>
                        </aside>
                    </div>
                </main>

                <footer className="bg-ctu-dark text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                        <i className="fa-solid fa-gear text-ctu-dark text-lg"></i>
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-white text-sm leading-tight">COTIFY</h1>
                                        <p className="text-[10px] text-slate-400">College of Technology</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                                    The official announcement and event management portal of the College of Technology. Stay informed, stay connected.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li><Link href="/client" className="hover:text-white transition-colors">Home</Link></li>
                                    <li><a href="#announcements" className="hover:text-white transition-colors">Announcements</a></li>
                                    <li><a href="#events" className="hover:text-white transition-colors">Events</a></li>
                                    <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex items-center gap-2"><i className="fa-solid fa-location-dot w-4 text-ctu-lightblue"></i> Cotify City, Cebu</li>
                                    <li className="flex items-center gap-2"><i className="fa-regular fa-envelope w-4 text-ctu-lightblue"></i> info@cotify.edu.ph</li>
                                    <li className="flex items-center gap-2"><i className="fa-solid fa-phone w-4 text-ctu-lightblue"></i> (032) 123-4567</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                            <div className="flex items-center gap-4 text-slate-400">
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-facebook"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-instagram"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* ========================================== */}
                {/* INTERACTIVE MODAL WITH DISCUSSION          */}
                {/* ========================================== */}
                {selectedAnnouncement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedAnnouncement(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
                            
                            <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-md transition-colors z-20" aria-label="Close">
                                <i className="fa-solid fa-times"></i>
                            </button>

                            <div className="h-56 overflow-hidden rounded-t-2xl relative">
                                <img src={selectedAnnouncement.image ?? '/images/download.jpg'} alt={selectedAnnouncement.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getBadgeClass(selectedAnnouncement.category)}`}>{selectedAnnouncement.category}</span>
                                    <span className="text-xs text-slate-400">{formatDate(selectedAnnouncement.date)}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">{selectedAnnouncement.title}</h2>
                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <i className="fa-solid fa-building text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Posted by</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAnnouncement.posted_by}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6">{selectedAnnouncement.content}</p>
                                
                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 mb-8">
                                    <button className="bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                                        <i className="fa-regular fa-bookmark"></i> Save for Later
                                    </button>
                                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                                        <i className="fa-solid fa-share-nodes"></i> Share
                                    </button>
                                </div>

                                {/* INTERACTIVE DISCUSSION */}
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mt-6">
                                    
                                    <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <i className="fa-solid fa-comments text-sm"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">Discussion & Q&A</h3>
                                                <p className="text-xs text-slate-500">Ask a question about this post</p>
                                            </div>
                                        </div>
                                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">{comments.length} Comments</span>
                                    </div>

                                    <div className="p-5 h-64 overflow-y-auto space-y-5 bg-white">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3 animate-slide-in">
                                                <div className={`w-8 h-8 rounded-full ${comment.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                                                    {comment.author.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="font-bold text-xs text-slate-900">{comment.author}</span>
                                                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide px-1.5 py-0.5 bg-slate-100 rounded">{comment.role}</span>
                                                        <span className="text-[10px] text-slate-400 ml-auto">{comment.time}</span>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed ${
                                                        comment.author === 'You' 
                                                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' 
                                                            : comment.role === 'Organizer'
                                                                ? 'bg-blue-50 text-blue-900 border border-blue-100'
                                                                : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {comment.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={commentsEndRef} />
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                                        <form onSubmit={handleSubmitComment} className="relative flex items-end gap-2">
                                            <div className="relative flex-1">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= maxChars) {
                                                            setNewComment(e.target.value);
                                                        }
                                                    }}
                                                    onFocus={() => setIsTyping(true)}
                                                    onBlur={() => setIsTyping(false)}
                                                    placeholder="Write a comment or question..."
                                                    rows={2}
                                                    className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none shadow-sm"
                                                />
                                                <span className={`absolute right-3 bottom-2.5 text-[10px] font-bold ${newComment.length >= maxChars ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {newComment.length}/{maxChars}
                                                </span>
                                            </div>
                                            <button type="submit" disabled={!newComment.trim()} className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shrink-0 mb-0.5">
                                                <i className="fa-solid fa-paper-plane text-sm"></i>
                                            </button>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}