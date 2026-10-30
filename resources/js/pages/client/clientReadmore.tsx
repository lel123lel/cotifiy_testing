import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

interface DiscussionMessage {
    id: number;
    parent_message_id: number | null;
    author: string;
    role: 'Client' | 'Admin';
    content: string;
    sent_at: string | null;
    is_mine: boolean;
}

interface AnnouncementDetailsProps {
    announcement: Announcement;
    messages: DiscussionMessage[];
    userName?: string;
}

export default function AnnouncementDetails({
    announcement,
    messages,
    userName = 'Guest',
}: AnnouncementDetailsProps) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '' });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const commentsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const comments = useMemo(
        () => messages.filter((m) => m.role === 'Client' && m.parent_message_id === null),
        [messages],
    );
    const unthreadedReplies = useMemo(
        () => messages.filter((m) => m.role === 'Admin' && m.parent_message_id === null),
        [messages],
    );
    const replyCount = useMemo(
        () => messages.filter((m) => m.parent_message_id !== null).length,
        [messages],
    );

    useEffect(() => {
        let timeout: number;
        let isMounted = true;

        const reloadMessages = () => {
            router.reload({
                only: ['messages'],
                showProgress: false,
                onFinish: () => {
                    if (isMounted) {
                        timeout = window.setTimeout(reloadMessages, 5000);
                    }
                },
            });
        };

        timeout = window.setTimeout(reloadMessages, 5000);

        return () => {
            isMounted = false;
            window.clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close profile dropdown when clicking outside (FIXED FOR MOBILE TOUCH) */
    useEffect(() => {
        if (!isProfileOpen) return;
        
        const onPointerDown = (e: PointerEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsProfileOpen(false);
        };
        
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onEsc);
        
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onEsc);
        };
    }, [isProfileOpen]);

    const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.content.trim() || processing) return;

        post(`/client/announcements/${announcement.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const scrollToComments = () => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
        month: 'long',
        day: 'numeric',
    });

    const formatDateShort = (date: string): string => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formatTime = (time: string | null): string => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : 'Time TBA';

    const readingTime = Math.max(1, Math.ceil(announcement.content.split(/\s+/).length / 200));

    return (
        <>
            <Head title={`${announcement.title} | COTIFY`} />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes revealUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
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
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }

                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.6s ease-out forwards; }
                .animate-reveal-up { animation: revealUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-float { animation: floatY 6s ease-in-out infinite; }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradientShift 8s ease infinite;
                }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .shape-spin { animation: spin-slow 40s linear infinite; }
                .animate-pulse-soft { animation: pulse-soft 8s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }

                .text-balance { text-wrap: balance; }
                .comment-scroll::-webkit-scrollbar { width: 6px; }
                .comment-scroll::-webkit-scrollbar-track { background: transparent; }
                .comment-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }

                @media (prefers-reduced-motion: reduce) {
                    .shape-move-1, .shape-move-2, .shape-move-3, .animate-float,
                    .animate-gradient, .shape-spin, .animate-pulse-soft,
                    .animate-fade-in, .animate-slide-up, .animate-reveal-up, .animate-scale-in {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 antialiased min-h-screen relative overflow-x-hidden">

                {/* ========================================= */}
                {/* MOVING SHAPES BACKGROUND                   */}
                {/* ========================================= */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[8%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[40%] left-[45%] w-[22rem] h-[22rem] bg-purple-500/8 rounded-full blur-3xl shape-move-3"></div>

                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[3px] border-blue-500/20 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[4px] border-indigo-600/20 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-400/30 rounded-full shape-move-3"></div>

                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/10 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[4px] border-blue-600/15 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>

                    <div className="absolute top-[45%] left-[12%] w-32 h-32 bg-indigo-600/10 clip-octagon shape-move-3"></div>
                    <div className="absolute bottom-[35%] right-[35%] w-48 h-48 border-[4px] border-blue-500/15 clip-octagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-octagon scale-[0.95]"></div>
                    </div>

                    <div className="absolute top-[70%] right-[10%] w-28 h-28 border-[3px] border-blue-500/20 rotate-45 shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[40%] w-16 h-16 bg-indigo-600/15 rotate-12 shape-move-3"></div>
                    <div className="absolute top-[85%] left-[8%] w-24 h-24 bg-purple-500/10 clip-diamond shape-move-2"></div>

                    <div className="absolute top-[10%] right-[40%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-blue-500/15 shape-move-2"></div>
                    <div className="absolute bottom-[40%] left-[5%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[50px] border-t-indigo-600/15 shape-move-1"></div>

                    <div className="absolute top-[30%] right-[5%] w-3 h-48 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[25%] w-48 h-3 bg-gradient-to-r from-indigo-600/20 to-transparent rounded-full shape-move-3"></div>

                    <div className="absolute top-[5%] right-[5%] w-64 h-64 border-[15px] border-blue-600/10 rounded-full shape-move-3"></div>
                    <div className="absolute bottom-[5%] right-[30%] w-24 h-24 bg-blue-500/15 clip-octagon shape-move-1"></div>
                    <div className="absolute top-[55%] left-[30%] w-20 h-20 border-[3px] border-blue-500/20 rotate-45 shape-move-2"></div>
                    <div className="absolute top-[85%] right-[10%] w-56 h-2 bg-gradient-to-r from-transparent via-indigo-600/25 to-transparent rounded-full shape-move-1"></div>
                </div>

                {/* ========================================= */}
                {/* MAIN CONTENT                                */}
                {/* ========================================= */}
                <div className="relative z-10">

                    {/* HEADER */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-ctu-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
                                {/* LOGO */}
                                <Link href="/client/clientpage" className="flex items-center group min-w-0">
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify Logo"
                                       className="w-30 h-30 object-contain -ml-3 -mr-6"
                                    />
                                    <div className="min-w-0">
                                        <h1 className="font-extrabold text-white text-sm sm:text-lg leading-tight tracking-tight truncate">COTIFY</h1>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">College of Technology</p>
                                    </div>
                                </Link>

                                {/* RIGHT ACTIONS */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={scrollToComments}
                                        className="hidden md:flex text-sm font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all items-center gap-2 border border-slate-700"
                                    >
                                        <i className="fa-solid fa-comments text-xs"></i> Comments
                                    </button>

                                    {/* Profile dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileOpen((v) => !v)}
                                            aria-haspopup="menu"
                                            aria-expanded={isProfileOpen}
                                            aria-label="Open profile menu"
                                            className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all touch-manipulation"
                                        >
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-ctu-lightblue to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-200 hidden sm:block max-w-[80px] truncate">
                                                {userName}
                                            </span>
                                            <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 hidden sm:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                                        </button>

                                        {/* Dropdown */}
                                        {isProfileOpen && (
                                            <div
                                                role="menu"
                                                className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-scale-in origin-top-right"
                                            >
                                                <div className="p-2">
                                                    <a
                                                        href="/client/profile"
                                                        role="menuitem"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors"
                                                    >
                                                        <i className="fa-regular fa-user w-4 text-center"></i> My Profile
                                                    </a>
                                                    <a
                                                        href="/client/notifications"
                                                        role="menuitem"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors"
                                                    >
                                                        <i className="fa-regular fa-bell w-4 text-center"></i> Notifications
                                                    </a>
                                                    <a
                                                        href="/client/settings"
                                                        role="menuitem"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors"
                                                    >
                                                        <i className="fa-solid fa-gear w-4 text-center"></i> Settings
                                                    </a>
                                                    <hr className="my-2 border-slate-100" />
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        role="menuitem"
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Log Out
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Back button */}
                                    <Link
                                        href="/client/clientpage"
                                        className="text-sm font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                                        aria-label="Back to home"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                        <span className="hidden sm:inline">Back</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="pt-24 sm:pt-28 pb-16 sm:pb-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

                        {/* BREADCRUMB */}
                        <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500 mb-4 sm:mb-6 animate-fade-in overflow-hidden">
                            <Link href="/client/clientpage" className="hover:text-ctu-lightblue transition-colors shrink-0">Home</Link>
                            <i className="fa-solid fa-chevron-right text-[8px] text-slate-400 shrink-0"></i>
                            <span className="text-slate-400 shrink-0">Announcements</span>
                            <i className="fa-solid fa-chevron-right text-[8px] text-slate-400 shrink-0"></i>
                            <span className="text-slate-700 truncate">{announcement.title}</span>
                        </nav>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                            {/* ===================== MAIN ARTICLE COLUMN ===================== */}
                            <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">

                                {/* HERO / ARTICLE */}
                                <article className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] shadow-2xl shadow-slate-300/40 border border-white/60 overflow-hidden animate-slide-up">

                                    {/* Hero image */}
                                    <div className="relative h-56 sm:h-80 lg:h-96 w-full overflow-hidden">
                                        <img
                                            src={announcement.image ?? '/images/download.jpg'}
                                            alt={announcement.title}
                                            className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-[2000ms]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                                        {/* Category badge */}
                                        <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                                            <span className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md ${getBadgeClass(announcement.category)}`}>
                                                <i className="fa-solid fa-circle text-[5px] sm:text-[6px]"></i>
                                                {announcement.category}
                                            </span>
                                        </div>

                                        {/* Reading time */}
                                        <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-bold">
                                                <i className="fa-regular fa-clock"></i>
                                                {readingTime} min
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-10">
                                            <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight text-balance drop-shadow-lg">
                                                {announcement.title}
                                            </h1>
                                        </div>
                                    </div>

                                    {/* Author meta */}
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-8 lg:px-10 py-4 sm:py-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-ctu-lightblue to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shrink-0">
                                                    {announcement.posted_by.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Posted by</p>
                                                    <p className="text-sm font-extrabold text-slate-800 truncate">{announcement.posted_by}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <i className="fa-regular fa-calendar text-slate-400"></i>
                                                    {formatDate(announcement.date)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={scrollToComments}
                                                    className="flex items-center gap-1.5 hover:text-ctu-lightblue transition-colors"
                                                >
                                                    <i className="fa-solid fa-comments text-slate-400"></i>
                                                    {comments.length}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article body */}
                                    <div className="p-4 sm:p-8 lg:p-10">
                                        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-slate-700 leading-relaxed font-medium whitespace-pre-line text-balance">
                                            {announcement.content}
                                        </div>

                                        {/* Event details */}
                                        {(announcement.event_date || announcement.location) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100">
                                                {announcement.event_date && (
                                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                            <i className="fa-regular fa-calendar-check text-sm"></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest mb-1">Event schedule</p>
                                                            <p className="text-sm font-bold text-slate-800">{formatDateShort(announcement.event_date)}</p>
                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                {announcement.start_time && announcement.end_time
                                                                    ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
                                                                    : formatTime(announcement.start_time)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {announcement.location && (
                                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                            <i className="fa-solid fa-location-dot text-sm"></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest mb-1">Location</p>
                                                            <p className="text-sm font-bold text-slate-800 break-words">{announcement.location}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <button type="button" className="bg-ctu-dark hover:bg-slate-800 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 hover:-translate-y-0.5">
                                                    <i className="fa-regular fa-bookmark"></i> Save
                                                </button>
                                                <button type="button" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                                                    <i className="fa-solid fa-share-nodes"></i> Share
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={scrollToComments}
                                                className="text-xs font-bold text-ctu-lightblue hover:text-blue-700 transition-colors flex items-center gap-1.5"
                                            >
                                                Comments <i className="fa-solid fa-arrow-down text-[10px]"></i>
                                            </button>
                                        </div>
                                    </div>
                                </article>

                                {/* COMMENTS SECTION */}
                                <section
                                    ref={commentsRef}
                                    className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] shadow-2xl shadow-slate-300/40 border border-white/60 overflow-hidden scroll-mt-24 sm:scroll-mt-28 animate-slide-up"
                                    style={{ animationDelay: '0.15s' }}
                                >
                                    {/* Header */}
                                    <div className="relative bg-gradient-to-br from-ctu-dark to-slate-800 px-4 sm:px-8 lg:px-10 py-4 sm:py-6 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-ctu-lightblue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                        <div className="relative flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shrink-0">
                                                <i className="fa-solid fa-comments text-base sm:text-xl"></i>
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-base sm:text-lg font-extrabold text-white">Discussion</h2>
                                                <p className="text-[11px] sm:text-xs font-semibold text-slate-300 mt-0.5">
                                                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'} · {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments list */}
                                    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-h-none sm:max-h-[36rem] overflow-y-auto comment-scroll bg-gradient-to-b from-white to-slate-50/50">
                                        {comments.length === 0 && (
                                            <div className="text-center py-10 sm:py-12">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                                    <i className="fa-regular fa-comment text-slate-300 text-xl sm:text-2xl"></i>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 mb-1">No comments yet</p>
                                                <p className="text-xs font-medium text-slate-500">Be the first to share your thoughts below.</p>
                                            </div>
                                        )}
                                        {comments.map((comment, i) => (
                                            <div
                                                key={comment.id}
                                                className="animate-fade-in"
                                                style={{ animationDelay: `${i * 0.05}s` }}
                                            >
                                                <CommentThread
                                                    comment={comment}
                                                    replies={messages.filter((m) => m.parent_message_id === comment.id)}
                                                />
                                            </div>
                                        ))}

                                        {unthreadedReplies.length > 0 && (
                                            <div className="pt-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-px bg-slate-200 flex-1"></div>
                                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Earlier admin replies</span>
                                                    <div className="h-px bg-slate-200 flex-1"></div>
                                                </div>
                                                <div className="space-y-4">
                                                    {unthreadedReplies.map((reply) => (
                                                        <ClientMessageCard key={reply.id} message={reply} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Composer */}
                                    <div className="p-3 sm:p-6 lg:p-8 bg-white border-t border-slate-100">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-md shrink-0">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-slate-800">Write a comment</p>
                                                <p className="text-[11px] font-medium text-slate-500">Your message will be visible to admins.</p>
                                            </div>
                                        </div>
                                        <form onSubmit={handleSubmitComment} className="relative">
                                            <textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                placeholder="Share a comment or concern about this announcement..."
                                                rows={3}
                                                maxLength={5000}
                                                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all resize-none shadow-sm"
                                            />
                                            {errors.content && <p className="mt-2 text-xs font-bold text-red-600">{errors.content}</p>}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                                                <span className="text-[11px] font-semibold text-slate-400 order-2 sm:order-1">
                                                    {data.content.length}/5000 characters
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={!data.content.trim() || processing}
                                                    className="order-1 sm:order-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-ctu-lightblue to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:shadow-none transition-all hover:-translate-y-0.5"
                                                >
                                                    {processing ? 'Posting...' : 'Post'} <i className="fa-solid fa-paper-plane text-[10px]"></i>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </section>
                            </div>

                            {/* ===================== SIDEBAR ===================== */}
                            <aside className="lg:col-span-4 space-y-4 sm:space-y-6 min-w-0">

                                {/* Quick info */}
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 overflow-hidden animate-slide-up" style={{ animationDelay: '0.05s' }}>
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-circle-info text-ctu-lightblue"></i> Quick Info
                                        </h3>
                                    </div>
                                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                                        <InfoRow icon="fa-building" color="text-blue-600" bg="bg-blue-50" label="Posted by" value={announcement.posted_by} />
                                        <InfoRow icon="fa-calendar" color="text-emerald-600" bg="bg-emerald-50" label="Date posted" value={formatDateShort(announcement.date)} />
                                        {announcement.event_date && (
                                            <InfoRow
                                                icon="fa-clock"
                                                color="text-amber-600"
                                                bg="bg-amber-50"
                                                label="Event date"
                                                value={formatDateShort(announcement.event_date)}
                                            />
                                        )}
                                        {announcement.start_time && (
                                            <InfoRow
                                                icon="fa-hourglass-half"
                                                color="text-purple-600"
                                                bg="bg-purple-50"
                                                label="Time"
                                                value={
                                                    announcement.start_time && announcement.end_time
                                                        ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
                                                        : formatTime(announcement.start_time)
                                                }
                                            />
                                        )}
                                        {announcement.location && (
                                            <InfoRow icon="fa-location-dot" color="text-rose-600" bg="bg-rose-50" label="Location" value={announcement.location} />
                                        )}
                                        <InfoRow icon="fa-tag" color="text-slate-600" bg="bg-slate-100" label="Category" value={announcement.category} />
                                    </div>
                                </div>

                                {/* Activity */}
                                <div className="bg-gradient-to-br from-ctu-dark to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-2xl border border-slate-800 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-ctu-lightblue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                                    <div className="relative">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 sm:mb-4 border border-white/10">
                                            <i className="fa-solid fa-chart-line text-white text-base sm:text-lg"></i>
                                        </div>
                                        <h3 className="font-extrabold text-base sm:text-lg mb-3 sm:mb-4">Discussion activity</h3>
                                        <div className="space-y-2.5 sm:space-y-3">
                                            <StatRow label="Comments" value={comments.length} icon="fa-comments" />
                                            <StatRow label="Admin replies" value={replyCount} icon="fa-reply" />
                                            <StatRow label="Reading time" value={`${readingTime} min`} icon="fa-book-open" />
                                        </div>
                                    </div>
                                </div>

                                {/* Browse CTA */}
                                <Link
                                    href="/client/clientpage"
                                    className="block bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 p-4 sm:p-6 hover:shadow-2xl hover:border-ctu-lightblue/40 transition-all group animate-slide-up"
                                    style={{ animationDelay: '0.15s' }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Browse more</p>
                                            <p className="text-sm font-extrabold text-slate-900 group-hover:text-ctu-lightblue transition-colors">All announcements</p>
                                        </div>
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ctu-lightblue/10 text-ctu-lightblue flex items-center justify-center group-hover:bg-ctu-lightblue group-hover:text-white transition-all shrink-0">
                                            <i className="fa-solid fa-arrow-right text-sm"></i>
                                        </div>
                                    </div>
                                </Link>
                            </aside>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="bg-ctu-dark text-white mt-10 border-t border-slate-800 py-8 sm:py-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-3 sm:gap-4">
                            <div className="flex items-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                   className="w-30 h-30 object-contain -ml-3 -mr-6"
                                />
                                <h1 className="font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight">COTIFY</h1>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                        </div>
                    </footer>
                </div>

                {/* Scroll-top */}
                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-ctu-dark hover:bg-ctu-lightblue text-white shadow-2xl flex items-center justify-center transition-all animate-scale-in hover:-translate-y-1"
                        aria-label="Scroll to top"
                    >
                        <i className="fa-solid fa-arrow-up text-sm"></i>
                    </button>
                )}
            </div>
        </>
    );
}

/* ---------- Sub-components ---------- */

function InfoRow({
    icon,
    color,
    bg,
    label,
    value,
}: {
    icon: string;
    color: string;
    bg: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                <i className={`fa-solid ${icon} text-xs sm:text-sm`}></i>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-800 break-words">{value}</p>
            </div>
        </div>
    );
}

function StatRow({ label, value, icon }: { label: string; value: number | string; icon: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <i className={`fa-solid ${icon} text-[10px] text-slate-400`}></i> {label}
            </span>
            <span className="text-sm font-extrabold text-white">{value}</span>
        </div>
    );
}

function CommentThread({
    comment,
    replies,
}: {
    comment: DiscussionMessage;
    replies: DiscussionMessage[];
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <ClientMessageCard message={comment} />
            {replies.length > 0 && (
                <div className="ml-3 sm:ml-6 mt-3 sm:mt-4 space-y-3 border-l-2 border-blue-100 pl-3 sm:pl-4">
                    {replies.map((reply) => (
                        <ClientMessageCard key={reply.id} message={reply} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ClientMessageCard({ message }: { message: DiscussionMessage }) {
    const isAdmin = message.role === 'Admin';
    return (
        <div className="flex gap-2.5 sm:gap-3">
            <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${
                    isAdmin
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                } text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 shadow-md`}
            >
                {message.author.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-1.5">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[140px] sm:max-w-none">
                        {message.author}
                    </span>
                    <span
                        className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            isAdmin
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                        }`}
                    >
                        {isAdmin ? 'Admin' : 'Client'}
                    </span>
                    {message.sent_at && (
                        <time className="text-[10px] font-semibold text-slate-400 ml-auto" dateTime={message.sent_at}>
                            {new Date(message.sent_at).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                            })}
                        </time>
                    )}
                </div>
                <div
                    className={`w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap break-words ${
                        isAdmin
                            ? 'bg-blue-50/70 text-blue-900 border border-blue-100'
                            : 'bg-slate-50 text-slate-800 border border-slate-100'
                    }`}
                >
                    {message.content}
                </div>
            </div>
        </div>
    );
}