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
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const commentsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const comments = useMemo(
        () => messages.filter((message) => message.parent_message_id === null),
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
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target as Node)
            ) {
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
        commentsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const getBadgeClass = (category: string): string => {
        switch (category) {
            case 'Academic':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Event':
                return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Service':
                return 'bg-rose-100 text-rose-700 border border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const formatDate = (date: string): string =>
        new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const formatDateShort = (date: string): string =>
        new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const formatTime = (time: string | null): string =>
        time
            ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
              })
            : 'Time TBA';

    const readingTime = Math.max(
        1,
        Math.ceil(announcement.content.split(/\s+/).length / 200),
    );

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

            <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 font-sans text-slate-800 antialiased">
                {/* ========================================= */}
                {/* MOVING SHAPES BACKGROUND                   */}
                {/* ========================================= */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <div className="shape-move-1 absolute top-[8%] left-[8%] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl"></div>
                    <div className="shape-move-2 absolute right-[10%] bottom-[10%] h-[35rem] w-[35rem] rounded-full bg-indigo-500/10 blur-3xl"></div>
                    <div className="shape-move-3 absolute top-[40%] left-[45%] h-[22rem] w-[22rem] rounded-full bg-purple-500/8 blur-3xl"></div>

                    <div className="shape-move-1 absolute top-[15%] right-[15%] h-[25rem] w-[25rem] rounded-full border-[3px] border-blue-500/20"></div>
                    <div className="shape-move-2 absolute bottom-[20%] left-[10%] h-32 w-32 rounded-full border-[4px] border-indigo-600/20"></div>
                    <div className="shape-move-3 absolute top-[60%] right-[30%] h-20 w-20 rounded-full border-[2px] border-blue-400/30"></div>

                    <div className="clip-hexagon shape-move-2 absolute top-[20%] left-[30%] h-40 w-40 bg-blue-500/10"></div>
                    <div className="clip-hexagon shape-move-1 absolute right-[20%] bottom-[15%] h-56 w-56 border-[4px] border-blue-600/15 bg-transparent">
                        <div className="clip-hexagon h-full w-full scale-[0.95] bg-blue-500/5"></div>
                    </div>

                    <div className="clip-octagon shape-move-3 absolute top-[45%] left-[12%] h-32 w-32 bg-indigo-600/10"></div>
                    <div className="clip-octagon shape-move-1 absolute right-[35%] bottom-[35%] h-48 w-48 border-[4px] border-blue-500/15 bg-transparent">
                        <div className="clip-octagon h-full w-full scale-[0.95] bg-blue-500/5"></div>
                    </div>

                    <div className="shape-move-2 absolute top-[70%] right-[10%] h-28 w-28 rotate-45 border-[3px] border-blue-500/20"></div>
                    <div className="shape-move-3 absolute bottom-[10%] left-[40%] h-16 w-16 rotate-12 bg-indigo-600/15"></div>
                    <div className="clip-diamond shape-move-2 absolute top-[85%] left-[8%] h-24 w-24 bg-purple-500/10"></div>

                    <div className="shape-move-2 absolute top-[10%] right-[40%] h-0 w-0 border-r-[40px] border-b-[60px] border-l-[40px] border-r-transparent border-b-blue-500/15 border-l-transparent"></div>
                    <div className="shape-move-1 absolute bottom-[40%] left-[5%] h-0 w-0 border-t-[50px] border-r-[30px] border-l-[30px] border-t-indigo-600/15 border-r-transparent border-l-transparent"></div>

                    <div className="shape-move-1 absolute top-[30%] right-[5%] h-48 w-3 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent"></div>
                    <div className="shape-move-3 absolute bottom-[20%] left-[25%] h-3 w-48 rounded-full bg-gradient-to-r from-indigo-600/20 to-transparent"></div>

                    <div className="shape-move-3 absolute top-[5%] right-[5%] h-64 w-64 rounded-full border-[15px] border-blue-600/10"></div>
                    <div className="clip-octagon shape-move-1 absolute right-[30%] bottom-[5%] h-24 w-24 bg-blue-500/15"></div>
                    <div className="shape-move-2 absolute top-[55%] left-[30%] h-20 w-20 rotate-45 border-[3px] border-blue-500/20"></div>
                    <div className="shape-move-1 absolute top-[85%] right-[10%] h-2 w-56 rounded-full bg-gradient-to-r from-transparent via-indigo-600/25 to-transparent"></div>
                </div>

                {/* ========================================= */}
                {/* MAIN CONTENT                                */}
                {/* ========================================= */}
                <div className="relative z-10">
                    {/* HEADER */}
                    <header className="bg-ctu-dark/90 fixed top-0 right-0 left-0 z-50 border-b border-white/10 shadow-lg backdrop-blur-xl">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between gap-2 sm:h-20">
                                {/* LOGO */}
                                <Link
                                    href="/client/clientpage"
                                    className="group flex min-w-0 items-center"
                                >
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify Logo"
                                        className="-mr-6 -ml-3 h-30 w-30 object-contain"
                                    />
                                    <div className="min-w-0">
                                        <h1 className="truncate text-sm leading-tight font-extrabold tracking-tight text-white sm:text-lg">
                                            COTIFY
                                        </h1>
                                        <p className="truncate text-[9px] font-bold tracking-widest text-slate-400 uppercase sm:text-[10px]">
                                            College of Technology
                                        </p>
                                    </div>
                                </Link>

                                {/* RIGHT ACTIONS */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={scrollToComments}
                                        className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-slate-700 hover:text-white md:flex"
                                    >
                                        <i className="fa-solid fa-comments text-xs"></i>{' '}
                                        Comments
                                    </button>

                                    {/* Profile dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsProfileOpen((v) => !v)
                                            }
                                            aria-haspopup="menu"
                                            aria-expanded={isProfileOpen}
                                            aria-label="Open profile menu"
                                            className="flex touch-manipulation items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 p-1 pr-2 transition-all hover:bg-slate-800 sm:pr-3"
                                        >
                                            <div className="from-ctu-lightblue flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br to-blue-600 text-xs font-bold text-white shadow-inner sm:h-9 sm:w-9 sm:text-sm">
                                                {userName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="hidden max-w-[80px] truncate text-sm font-semibold text-slate-200 sm:block">
                                                {userName}
                                            </span>
                                            <i
                                                className={`fa-solid fa-chevron-down hidden text-[10px] text-slate-400 transition-transform sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
                                            ></i>
                                        </button>

                                        {/* Dropdown */}
                                        {isProfileOpen && (
                                            <div
                                                role="menu"
                                                className="animate-scale-in absolute right-0 z-[100] mt-2 w-56 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
                                            >
                                                <div className="p-2">
                                                    <a
                                                        href="/client/profile"
                                                        role="menuitem"
                                                        onClick={() =>
                                                            setIsProfileOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="hover:text-ctu-lightblue flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                    >
                                                        <i className="fa-regular fa-user w-4 text-center"></i>{' '}
                                                        My Profile
                                                    </a>
                                                    <a
                                                        href="/client/notifications"
                                                        role="menuitem"
                                                        onClick={() =>
                                                            setIsProfileOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="hover:text-ctu-lightblue flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                    >
                                                        <i className="fa-regular fa-bell w-4 text-center"></i>{' '}
                                                        Notifications
                                                    </a>
                                                    <a
                                                        href="/client/settings"
                                                        role="menuitem"
                                                        onClick={() =>
                                                            setIsProfileOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="hover:text-ctu-lightblue flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                    >
                                                        <i className="fa-solid fa-gear w-4 text-center"></i>{' '}
                                                        Settings
                                                    </a>
                                                    <hr className="my-2 border-slate-100" />
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        role="menuitem"
                                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                                                    >
                                                        <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>{' '}
                                                        Log Out
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Back button */}
                                    <Link
                                        href="/client/clientpage"
                                        className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-slate-700 hover:text-white sm:px-4"
                                        aria-label="Back to home"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                        <span className="hidden sm:inline">
                                            Back
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-3 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
                        {/* BREADCRUMB */}
                        <nav className="animate-fade-in mb-4 flex items-center gap-2 overflow-hidden text-[11px] font-bold text-slate-500 sm:mb-6 sm:text-xs">
                            <Link
                                href="/client/clientpage"
                                className="hover:text-ctu-lightblue shrink-0 transition-colors"
                            >
                                Home
                            </Link>
                            <i className="fa-solid fa-chevron-right shrink-0 text-[8px] text-slate-400"></i>
                            <span className="shrink-0 text-slate-400">
                                Announcements
                            </span>
                            <i className="fa-solid fa-chevron-right shrink-0 text-[8px] text-slate-400"></i>
                            <span className="truncate text-slate-700">
                                {announcement.title}
                            </span>
                        </nav>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                            {/* ===================== MAIN ARTICLE COLUMN ===================== */}
                            <div className="min-w-0 space-y-6 sm:space-y-8 lg:col-span-8">
                                {/* HERO / ARTICLE */}
                                <article className="animate-slide-up overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:rounded-[2rem]">
                                    {/* Hero image */}
                                    <div className="relative h-56 w-full overflow-hidden sm:h-80 lg:h-96">
                                        <img
                                            src={
                                                announcement.image ??
                                                '/images/download.jpg'
                                            }
                                            alt={announcement.title}
                                            className="h-full w-full scale-105 object-cover transition-transform duration-[2000ms] hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                                        {/* Category badge */}
                                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] font-extrabold tracking-widest uppercase shadow-lg backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-2 sm:text-xs ${getBadgeClass(announcement.category)}`}
                                            >
                                                <i className="fa-solid fa-circle text-[5px] sm:text-[6px]"></i>
                                                {announcement.category}
                                            </span>
                                        </div>

                                        {/* Reading time */}
                                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-[11px]">
                                                <i className="fa-regular fa-clock"></i>
                                                {readingTime} min
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-8 lg:p-10">
                                            <h1 className="text-xl leading-tight font-extrabold tracking-tight text-balance text-white drop-shadow-lg sm:text-3xl lg:text-5xl">
                                                {announcement.title}
                                            </h1>
                                        </div>
                                    </div>

                                    {/* Author meta */}
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
                                        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="from-ctu-lightblue flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-indigo-600 text-sm font-extrabold text-white shadow-lg sm:h-11 sm:w-11">
                                                    {announcement.posted_by
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                                        Posted by
                                                    </p>
                                                    <p className="truncate text-sm font-extrabold text-slate-800">
                                                        {announcement.posted_by}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 sm:gap-4 sm:text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <i className="fa-regular fa-calendar text-slate-400"></i>
                                                    {formatDate(
                                                        announcement.date,
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={scrollToComments}
                                                    className="hover:text-ctu-lightblue flex items-center gap-1.5 transition-colors"
                                                >
                                                    <i className="fa-solid fa-comments text-slate-400"></i>
                                                    {comments.length}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article body */}
                                    <div className="p-4 sm:p-8 lg:p-10">
                                        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none leading-relaxed font-medium text-balance whitespace-pre-line text-slate-700">
                                            {announcement.content}
                                        </div>

                                        {/* Event details */}
                                        {(announcement.event_date ||
                                            announcement.location) && (
                                            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:mt-10 sm:grid-cols-2 sm:gap-4 sm:pt-8">
                                                {announcement.event_date && (
                                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-3 sm:gap-4 sm:p-4">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 sm:h-10 sm:w-10">
                                                            <i className="fa-regular fa-calendar-check text-sm"></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="mb-1 text-[10px] font-extrabold tracking-widest text-amber-700 uppercase">
                                                                Event schedule
                                                            </p>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                {formatDateShort(
                                                                    announcement.event_date,
                                                                )}
                                                            </p>
                                                            <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                                {announcement.start_time &&
                                                                announcement.end_time
                                                                    ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
                                                                    : formatTime(
                                                                          announcement.start_time,
                                                                      )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {announcement.location && (
                                                    <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-3 sm:gap-4 sm:p-4">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 sm:h-10 sm:w-10">
                                                            <i className="fa-solid fa-location-dot text-sm"></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="mb-1 text-[10px] font-extrabold tracking-widest text-rose-700 uppercase">
                                                                Location
                                                            </p>
                                                            <p className="text-sm font-bold break-words text-slate-800">
                                                                {
                                                                    announcement.location
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action bar */}
                                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:mt-10 sm:pt-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="bg-ctu-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 sm:px-5"
                                                >
                                                    <i className="fa-regular fa-bookmark"></i>{' '}
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:px-5"
                                                >
                                                    <i className="fa-solid fa-share-nodes"></i>{' '}
                                                    Share
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={scrollToComments}
                                                className="text-ctu-lightblue flex items-center gap-1.5 text-xs font-bold transition-colors hover:text-blue-700"
                                            >
                                                Comments{' '}
                                                <i className="fa-solid fa-arrow-down text-[10px]"></i>
                                            </button>
                                        </div>
                                    </div>
                                </article>

                                {/* COMMENTS SECTION */}
                                <section
                                    ref={commentsRef}
                                    className="animate-slide-up scroll-mt-24 overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:scroll-mt-28 sm:rounded-[2rem]"
                                    style={{ animationDelay: '0.15s' }}
                                >
                                    {/* Header */}
                                    <div className="from-ctu-dark relative overflow-hidden bg-gradient-to-br to-slate-800 px-4 py-4 sm:px-8 sm:py-6 lg:px-10">
                                        <div className="bg-ctu-lightblue/20 absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl sm:h-40 sm:w-40"></div>
                                        <div className="relative flex items-center gap-3 sm:gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-md sm:h-12 sm:w-12 sm:rounded-2xl">
                                                <i className="fa-solid fa-comments text-base sm:text-xl"></i>
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-base font-extrabold text-white sm:text-lg">
                                                    Discussion
                                                </h2>
                                                <p className="mt-0.5 text-[11px] font-semibold text-slate-300 sm:text-xs">
                                                    {comments.length}{' '}
                                                    {comments.length === 1
                                                        ? 'comment'
                                                        : 'comments'}{' '}
                                                    · {replyCount}{' '}
                                                    {replyCount === 1
                                                        ? 'reply'
                                                        : 'replies'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments list */}
                                    <div className="comment-scroll max-h-none space-y-4 overflow-y-auto bg-gradient-to-b from-white to-slate-50/50 p-3 sm:max-h-[36rem] sm:space-y-5 sm:p-6 lg:p-8">
                                        {comments.length === 0 && (
                                            <div className="py-10 text-center sm:py-12">
                                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
                                                    <i className="fa-regular fa-comment text-xl text-slate-300 sm:text-2xl"></i>
                                                </div>
                                                <p className="mb-1 text-sm font-bold text-slate-700">
                                                    No comments yet
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Be the first to share your
                                                    thoughts below.
                                                </p>
                                            </div>
                                        )}
                                        {comments.map((comment, i) => (
                                            <div
                                                key={comment.id}
                                                className="animate-fade-in"
                                                style={{
                                                    animationDelay: `${i * 0.05}s`,
                                                }}
                                            >
                                                <CommentThread
                                                    message={comment}
                                                    messages={messages}
                                                    announcementId={
                                                        announcement.id
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Composer */}
                                    <div className="border-t border-slate-100 bg-white p-3 sm:p-6 lg:p-8">
                                        <div className="mb-3 flex items-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-extrabold text-white shadow-md sm:h-9 sm:w-9 sm:text-sm">
                                                {userName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-slate-800">
                                                    Write a comment
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-500">
                                                    Your message will be visible
                                                    to admins.
                                                </p>
                                            </div>
                                        </div>
                                        <form
                                            onSubmit={handleSubmitComment}
                                            className="relative"
                                        >
                                            <textarea
                                                value={data.content}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Share a comment or concern about this announcement..."
                                                rows={3}
                                                maxLength={5000}
                                                className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/10 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium shadow-sm transition-all outline-none focus:bg-white focus:ring-4 sm:p-4"
                                            />
                                            {errors.content && (
                                                <p className="mt-2 text-xs font-bold text-red-600">
                                                    {errors.content}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="order-2 text-[11px] font-semibold text-slate-400 sm:order-1">
                                                    {data.content.length}/5000
                                                    characters
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        !data.content.trim() ||
                                                        processing
                                                    }
                                                    className="from-ctu-lightblue order-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r to-blue-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:shadow-none sm:order-2 sm:w-auto"
                                                >
                                                    {processing
                                                        ? 'Posting...'
                                                        : 'Post'}{' '}
                                                    <i className="fa-solid fa-paper-plane text-[10px]"></i>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </section>
                            </div>

                            {/* ===================== SIDEBAR ===================== */}
                            <aside className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-4">
                                {/* Quick info */}
                                <div
                                    className="animate-slide-up overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-xl shadow-slate-300/30 backdrop-blur-xl sm:rounded-3xl"
                                    style={{ animationDelay: '0.05s' }}
                                >
                                    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6 sm:py-4">
                                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                                            <i className="fa-solid fa-circle-info text-ctu-lightblue"></i>{' '}
                                            Quick Info
                                        </h3>
                                    </div>
                                    <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                                        <InfoRow
                                            icon="fa-building"
                                            color="text-blue-600"
                                            bg="bg-blue-50"
                                            label="Posted by"
                                            value={announcement.posted_by}
                                        />
                                        <InfoRow
                                            icon="fa-calendar"
                                            color="text-emerald-600"
                                            bg="bg-emerald-50"
                                            label="Date posted"
                                            value={formatDateShort(
                                                announcement.date,
                                            )}
                                        />
                                        {announcement.event_date && (
                                            <InfoRow
                                                icon="fa-clock"
                                                color="text-amber-600"
                                                bg="bg-amber-50"
                                                label="Event date"
                                                value={formatDateShort(
                                                    announcement.event_date,
                                                )}
                                            />
                                        )}
                                        {announcement.start_time && (
                                            <InfoRow
                                                icon="fa-hourglass-half"
                                                color="text-purple-600"
                                                bg="bg-purple-50"
                                                label="Time"
                                                value={
                                                    announcement.start_time &&
                                                    announcement.end_time
                                                        ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
                                                        : formatTime(
                                                              announcement.start_time,
                                                          )
                                                }
                                            />
                                        )}
                                        {announcement.location && (
                                            <InfoRow
                                                icon="fa-location-dot"
                                                color="text-rose-600"
                                                bg="bg-rose-50"
                                                label="Location"
                                                value={announcement.location}
                                            />
                                        )}
                                        <InfoRow
                                            icon="fa-tag"
                                            color="text-slate-600"
                                            bg="bg-slate-100"
                                            label="Category"
                                            value={announcement.category}
                                        />
                                    </div>
                                </div>

                                {/* Activity */}
                                <div
                                    className="from-ctu-dark animate-slide-up relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br to-slate-900 p-5 text-white shadow-2xl sm:rounded-3xl sm:p-6"
                                    style={{ animationDelay: '0.1s' }}
                                >
                                    <div className="bg-ctu-lightblue/20 absolute top-0 right-0 h-40 w-40 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/20 blur-2xl"></div>
                                    <div className="relative">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
                                            <i className="fa-solid fa-chart-line text-base text-white sm:text-lg"></i>
                                        </div>
                                        <h3 className="mb-3 text-base font-extrabold sm:mb-4 sm:text-lg">
                                            Discussion activity
                                        </h3>
                                        <div className="space-y-2.5 sm:space-y-3">
                                            <StatRow
                                                label="Comments"
                                                value={comments.length}
                                                icon="fa-comments"
                                            />
                                            <StatRow
                                                label="Replies"
                                                value={replyCount}
                                                icon="fa-reply"
                                            />
                                            <StatRow
                                                label="Reading time"
                                                value={`${readingTime} min`}
                                                icon="fa-book-open"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Browse CTA */}
                                <Link
                                    href="/client/clientpage"
                                    className="hover:border-ctu-lightblue/40 group animate-slide-up block rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl shadow-slate-300/30 backdrop-blur-xl transition-all hover:shadow-2xl sm:rounded-3xl sm:p-6"
                                    style={{ animationDelay: '0.15s' }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                                Browse more
                                            </p>
                                            <p className="group-hover:text-ctu-lightblue text-sm font-extrabold text-slate-900 transition-colors">
                                                All announcements
                                            </p>
                                        </div>
                                        <div className="bg-ctu-lightblue/10 text-ctu-lightblue group-hover:bg-ctu-lightblue flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all group-hover:text-white sm:h-10 sm:w-10">
                                            <i className="fa-solid fa-arrow-right text-sm"></i>
                                        </div>
                                    </div>
                                </Link>
                            </aside>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="bg-ctu-dark mt-10 border-t border-slate-800 py-8 text-white sm:py-10">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:gap-4 sm:px-6 lg:px-8">
                            <div className="flex items-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                    className="-mr-6 -ml-3 h-30 w-30 object-contain"
                                />
                                <h1 className="text-base leading-tight font-extrabold tracking-tight text-white sm:text-lg">
                                    COTIFY
                                </h1>
                            </div>
                            <p className="text-xs font-medium text-slate-500 sm:text-sm">
                                &copy; {new Date().getFullYear()} COTIFY. All
                                rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>

                {/* Scroll-top */}
                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        className="bg-ctu-dark hover:bg-ctu-lightblue animate-scale-in fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:-translate-y-1 sm:right-6 sm:bottom-6 sm:h-12 sm:w-12"
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
            <div
                className={`h-8 w-8 rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${bg} ${color} flex shrink-0 items-center justify-center`}
            >
                <i className={`fa-solid ${icon} text-xs sm:text-sm`}></i>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    {label}
                </p>
                <p className="text-sm font-bold break-words text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function StatRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: number | string;
    icon: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <i
                    className={`fa-solid ${icon} text-[10px] text-slate-400`}
                ></i>{' '}
                {label}
            </span>
            <span className="text-sm font-extrabold text-white">{value}</span>
        </div>
    );
}

function CommentThread({
    message,
    messages,
    announcementId,
}: {
    message: DiscussionMessage;
    messages: DiscussionMessage[];
    announcementId: number;
}) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        parent_message_id: message.id,
    });
    const replies = messages.filter(
        (reply) => reply.parent_message_id === message.id,
    );

    const handleReply = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.content.trim() || processing) return;

        post(`/client/announcements/${announcementId}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsReplyOpen(false);
            },
        });
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <ClientMessageCard message={message} />
            <div className="mt-2 ml-10 sm:ml-12">
                <button
                    type="button"
                    onClick={() => setIsReplyOpen((open) => !open)}
                    className="text-ctu-lightblue text-xs font-bold transition-colors hover:text-blue-700"
                >
                    {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
                {isReplyOpen && (
                    <form
                        onSubmit={handleReply}
                        className="mt-3 flex items-end gap-2"
                    >
                        <div className="flex-1">
                            <label
                                htmlFor={`client-reply-${message.id}`}
                                className="sr-only"
                            >
                                Reply to {message.author}
                            </label>
                            <textarea
                                id={`client-reply-${message.id}`}
                                value={data.content}
                                onChange={(event) =>
                                    setData('content', event.target.value)
                                }
                                rows={2}
                                maxLength={5000}
                                placeholder={`Reply to ${message.author}...`}
                                className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/10 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium transition-all outline-none focus:bg-white focus:ring-4"
                            />
                            {errors.content && (
                                <p className="mt-1 text-xs font-bold text-red-600">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!data.content.trim() || processing}
                            className="bg-ctu-lightblue rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                        >
                            {processing ? 'Posting...' : 'Reply'}
                        </button>
                    </form>
                )}
            </div>
            {replies.length > 0 && (
                <div className="mt-3 ml-3 space-y-3 border-l-2 border-blue-100 pl-3 sm:mt-4 sm:ml-6 sm:pl-4">
                    {replies.map((reply) => (
                        <CommentThread
                            key={reply.id}
                            message={reply}
                            messages={messages}
                            announcementId={announcementId}
                        />
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
                className={`h-8 w-8 rounded-full sm:h-9 sm:w-9 ${
                    isAdmin
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                } flex shrink-0 items-center justify-center text-xs font-extrabold text-white shadow-md sm:text-sm`}
            >
                {message.author.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                    <span className="max-w-[140px] truncate text-xs font-extrabold text-slate-900 sm:max-w-none sm:text-sm">
                        {message.author}
                    </span>
                    <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-widest uppercase ${
                            isAdmin
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                        }`}
                    >
                        {isAdmin ? 'Admin' : 'Client'}
                    </span>
                    {message.sent_at && (
                        <time
                            className="ml-auto text-[10px] font-semibold text-slate-400"
                            dateTime={message.sent_at}
                        >
                            {new Date(message.sent_at).toLocaleString(
                                undefined,
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                },
                            )}
                        </time>
                    )}
                </div>
                <div
                    className={`w-full rounded-xl p-3 text-left text-xs leading-relaxed font-medium break-words whitespace-pre-wrap sm:rounded-2xl sm:p-3.5 sm:text-sm ${
                        isAdmin
                            ? 'border border-blue-100 bg-blue-50/70 text-blue-900'
                            : 'border border-slate-100 bg-slate-50 text-slate-800'
                    }`}
                >
                    {message.content}
                </div>
            </div>
        </div>
    );
}
