import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by: string;
    posted_by_name: string;
    posted_by_logo?: string | null;
    date: string;
    content: string;
    image: string | null;
    is_new?: boolean;
    is_pinned?: boolean;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    audience: string | null;
    reading_time?: string | null;
    has_rsvped?: boolean;
    attachments?: { name: string; url: string; size: string }[] | null;
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

interface ClientReadMoreProps {
    announcement: Announcement;
    messages: DiscussionMessage[];
    relatedAnnouncements?: Announcement[];
    unreadCount?: number;
    user?: {
        name: string;
        course: string;
        year_level: string;
    };
}

export default function ClientReadMore({
    announcement,
    messages,
    relatedAnnouncements = [],
    unreadCount = 0,
    user = { name: 'Juan', course: 'BSIT', year_level: '3rd Year' },
}: ClientReadMoreProps) {
    const { auth } = usePage<any>().props;
    const currentUser = auth?.user?.name || user.name;
    const isLoggedIn = auth?.user !== undefined;

    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });
    const replyForm = useForm({
        content: '',
        parent_message_id: null as number | null,
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Polling for new answers
    useEffect(() => {
        let timeout: number;
        let isMounted = true;
        const reloadMessages = () => {
            router.reload({
                only: ['messages'],
                showProgress: false,
                onFinish: () => {
                    if (isMounted)
                        timeout = window.setTimeout(reloadMessages, 5000);
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

    useEffect(() => {
        if (!isProfileOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target as Node)
            )
                setIsProfileOpen(false);
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

    const handleSubmitQuestion = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.content.trim() || processing) return;
        post(`/client/announcements/${announcement.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleSubmitReply = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            !replyForm.data.content.trim() ||
            replyForm.data.parent_message_id === null ||
            replyForm.processing
        )
            return;

        replyForm.post(`/client/announcements/${announcement.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                replyForm.reset();
                setReplyingTo(null);
            },
        });
    };

    // ✅ Same as ClientHome
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Academic':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const categoryLabel = (cat: string) =>
        cat === 'Event'
            ? 'Events'
            : cat === 'Academic'
              ? 'Academic'
              : cat === 'Service'
                ? 'Services'
                : 'General';

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

    const readingTime = announcement.reading_time || '1 min read';
    const isEvent =
        announcement.category === 'Event' && announcement.event_date;

    return (
        <>
            <Head title={`${announcement.title} | COTIFY`} />

            {/* ✅ SAME ANIMATIONS AS CLIENT HOME */}
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
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
                {/* ✅ SAME MOVING SHAPES BACKGROUND */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <div className="shape-move-2 absolute top-[5%] right-[10%] h-[35rem] w-[35rem] rounded-full bg-blue-500/5 blur-3xl"></div>
                    <div className="shape-move-1 absolute bottom-[10%] left-[5%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/5 blur-3xl"></div>
                    <div className="shape-move-3 absolute top-[30%] right-[30%] h-[25rem] w-[25rem] rounded-full bg-purple-500/5 blur-3xl"></div>
                    <div className="clip-diamond animate-spin-slow absolute top-[20%] left-[10%] h-40 w-40 border-[3px] border-blue-500/10"></div>
                    <div className="shape-move-1 absolute right-[15%] bottom-[25%] h-32 w-32 rotate-12 border-[4px] border-indigo-500/10"></div>
                    <div className="clip-hexagon shape-move-3 absolute top-[50%] right-[5%] h-56 w-56 bg-blue-400/5"></div>
                </div>

                {/* ✅ SAME DARK HEADER AS CLIENT HOME */}
                <header className="bg-ctu-dark/95 relative z-50 border-b border-white/10 shadow-lg backdrop-blur-xl">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
                            <div className="flex items-center gap-8">
                                <Link
                                    href="/client"
                                    className="flex shrink-0 items-center"
                                >
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify"
                                        className="-mr-3 -ml-1 h-10 w-10 object-contain sm:h-12 sm:w-12"
                                    />
                                    <span className="hidden text-xl font-extrabold text-white sm:block">
                                        Cotify
                                    </span>
                                </Link>

                                <nav className="hidden items-center gap-6 md:flex">
                                    <Link
                                        href="/client"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/client/announcements"
                                        className="border-ctu-lightblue border-b-2 pb-1 text-sm font-bold text-white"
                                    >
                                        Announcements
                                    </Link>
                                    <Link
                                        href="/client/events"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Events
                                    </Link>
                                    <Link
                                        href="/client/saved"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Saved
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative hidden sm:block">
                                    <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"></i>
                                    <input
                                        type="text"
                                        placeholder="Search announcements..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="focus:ring-ctu-lightblue w-64 rounded-lg border border-slate-700 bg-slate-800/50 py-2 pr-4 pl-9 text-sm text-white placeholder-slate-400 transition-all outline-none focus:ring-2"
                                    />
                                </div>

                                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-800">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                    {unreadCount > 0 && (
                                        <span className="border-ctu-dark absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() =>
                                            setIsProfileOpen(!isProfileOpen)
                                        }
                                        className="group flex cursor-pointer items-center gap-2 border-l border-slate-700 pl-2 sm:pl-4"
                                    >
                                        <div className="bg-ctu-lightblue flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                            {currentUser
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <span className="hidden text-sm font-semibold text-white lg:block">
                                            {currentUser.split(' ')[0]} D.
                                        </span>
                                        <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="animate-fade-in absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                                            <div className="p-2">
                                                <Link
                                                    href="/client/profile"
                                                    className="hover:text-ctu-lightblue flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                >
                                                    <i className="fa-regular fa-user w-4 text-center"></i>{' '}
                                                    My Profile
                                                </Link>
                                                <Link
                                                    href="/client/settings"
                                                    className="hover:text-ctu-lightblue flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                >
                                                    <i className="fa-solid fa-gear w-4 text-center"></i>{' '}
                                                    Settings
                                                </Link>
                                                <hr className="my-2 border-slate-100" />
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>{' '}
                                                    Log Out
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    {/* BREADCRUMB (issue #3 — replaces header "Back") */}
                    <nav className="animate-fade-in mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Link
                            href="/client"
                            className="hover:text-ctu-lightblue transition-colors"
                        >
                            Home
                        </Link>
                        <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                        <Link
                            href="/client/announcements"
                            className="hover:text-ctu-lightblue transition-colors"
                        >
                            Announcements
                        </Link>
                        <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                        <span className="max-w-[200px] truncate text-slate-700">
                            {announcement.title}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* LEFT COLUMN: MAIN CONTENT */}
                        <div className="space-y-6 lg:col-span-8">
                            <article className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                                {/* TITLE + SINGLE BYLINE (issue #4 — one byline, no Quick Info card) */}
                                <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                                    <div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <span
                                                className={`rounded border px-2 py-0.5 text-[10px] font-extrabold tracking-widest uppercase ${getCategoryColor(announcement.category)}`}
                                            >
                                                {categoryLabel(
                                                    announcement.category,
                                                )}
                                            </span>
                                            {announcement.is_new && (
                                                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-3xl">
                                            {announcement.title}
                                        </h1>

                                        {/* Byline: office · date · reading time (issue #4, #6 — avatar from office) */}
                                        <div className="mt-5 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500">
                                                {announcement.posted_by_logo ? (
                                                    <img
                                                        src={
                                                            announcement.posted_by_logo
                                                        }
                                                        alt={
                                                            announcement.posted_by
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    announcement.posted_by
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-extrabold text-slate-900">
                                                    {announcement.posted_by}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">
                                                    {formatDate(
                                                        announcement.date,
                                                    )}{' '}
                                                    · {readingTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save (dark) + Share (outline) — kept good pattern from audit */}
                                    <div className="flex shrink-0 gap-2 sm:flex-col">
                                        <button
                                            type="button"
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 sm:flex-none"
                                        >
                                            <i className="fa-regular fa-bookmark"></i>{' '}
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:flex-none"
                                        >
                                            <i className="fa-solid fa-link"></i>{' '}
                                            Copy link
                                        </button>
                                    </div>
                                </div>

                                {/* COVER IMAGE — title above (no contrast issue); default banner per category (issue #7 fix pattern) */}
                                <div className="relative mb-8 flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 sm:h-80">
                                    {announcement.image ? (
                                        <img
                                            src={announcement.image}
                                            alt={announcement.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <i
                                                className={`mb-3 text-5xl ${
                                                    announcement.category ===
                                                    'Academic'
                                                        ? 'fa-solid fa-graduation-cap'
                                                        : announcement.category ===
                                                            'Event'
                                                          ? 'fa-regular fa-calendar'
                                                          : announcement.category ===
                                                              'Service'
                                                            ? 'fa-solid fa-hand-holding-heart'
                                                            : 'fa-regular fa-newspaper'
                                                }`}
                                            ></i>
                                            <span className="text-xs font-bold tracking-widest uppercase">
                                                {categoryLabel(
                                                    announcement.category,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* BODY */}
                                <div className="mb-8 text-sm leading-relaxed whitespace-pre-line text-slate-700 sm:text-base">
                                    {announcement.content}
                                </div>

                                {/* ATTACHMENTS (issue #8) */}
                                {announcement.attachments &&
                                    announcement.attachments.length > 0 && (
                                        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <h4 className="mb-3 text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                                                Attachments
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {announcement.attachments.map(
                                                    (file, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={file.url}
                                                            className="hover:border-ctu-lightblue group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-all hover:shadow-sm"
                                                        >
                                                            <i className="fa-solid fa-file-pdf text-rose-500"></i>
                                                            <span className="group-hover:text-ctu-lightblue text-xs font-bold text-slate-700">
                                                                {file.name}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {file.size}
                                                            </span>
                                                        </a>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* ANNOUNCEMENT DISCUSSION */}
                                <div
                                    ref={commentsRef}
                                    className="mt-10 border-t border-slate-200 pt-8"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Comments & discussion
                                        </h3>
                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                            Ask a question or join the
                                            discussion about this announcement.
                                        </p>
                                    </div>

                                    {isLoggedIn ? (
                                        <form
                                            onSubmit={handleSubmitQuestion}
                                            className="mb-8"
                                        >
                                            <textarea
                                                value={data.content}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Write a comment..."
                                                rows={3}
                                                maxLength={5000}
                                                className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/10 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium shadow-sm transition-all outline-none focus:ring-4"
                                            />
                                            {errors.content && (
                                                <p className="mt-1 text-xs font-bold text-red-600">
                                                    {errors.content}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    {data.content.length} / 5000
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {/* Accessibility: show why disabled */}
                                                    {!data.content.trim() && (
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            Write something
                                                            first
                                                        </span>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !data.content.trim() ||
                                                            processing
                                                        }
                                                        className={`rounded-lg px-5 py-2 text-xs font-bold shadow-sm transition-colors ${
                                                            !data.content.trim() ||
                                                            processing
                                                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                                : 'bg-slate-800 text-white hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {processing
                                                            ? 'Sending...'
                                                            : 'Post comment'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                                            <p className="mb-2 text-sm font-bold text-slate-700">
                                                Log in to join the discussion.
                                            </p>
                                            <Link
                                                href="/auth/login"
                                                className="inline-block rounded-lg bg-slate-800 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-700"
                                            >
                                                Log In
                                            </Link>
                                        </div>
                                    )}

                                    <div
                                        className="space-y-3"
                                        aria-live="polite"
                                    >
                                        {messages.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                                                <i
                                                    className="fa-regular fa-comments mb-2 text-2xl text-slate-400"
                                                    aria-hidden="true"
                                                ></i>
                                                <p className="text-sm font-semibold text-slate-600">
                                                    No comments yet
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Be the first to start the
                                                    discussion.
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map((message) => (
                                                <article
                                                    key={message.id}
                                                    className={`rounded-xl border p-4 ${
                                                        message.role === 'Admin'
                                                            ? 'border-blue-100 bg-blue-50/70'
                                                            : 'border-slate-200 bg-white'
                                                    } ${message.parent_message_id ? 'ml-5 sm:ml-10' : ''}`}
                                                >
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {message.author}
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                message.role ===
                                                                'Admin'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {message.role ===
                                                            'Admin'
                                                                ? announcement.posted_by
                                                                : 'Student'}
                                                        </span>
                                                        {message.is_mine && (
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                You
                                                            </span>
                                                        )}
                                                        {message.sent_at && (
                                                            <time
                                                                className="ml-auto text-[10px] font-medium text-slate-400"
                                                                dateTime={
                                                                    message.sent_at
                                                                }
                                                            >
                                                                {new Date(
                                                                    message.sent_at,
                                                                ).toLocaleString()}
                                                            </time>
                                                        )}
                                                    </div>
                                                    <p className="text-sm leading-6 break-words whitespace-pre-wrap text-slate-700">
                                                        {message.content}
                                                    </p>
                                                    {isLoggedIn && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    replyingTo ===
                                                                    message.id
                                                                ) {
                                                                    setReplyingTo(
                                                                        null,
                                                                    );
                                                                    replyForm.reset();
                                                                    replyForm.clearErrors();
                                                                    return;
                                                                }

                                                                setReplyingTo(
                                                                    message.id,
                                                                );
                                                                replyForm.setData(
                                                                    {
                                                                        content:
                                                                            '',
                                                                        parent_message_id:
                                                                            message.id,
                                                                    },
                                                                );
                                                                replyForm.clearErrors();
                                                            }}
                                                            className="text-ctu-lightblue mt-3 text-xs font-bold transition hover:text-blue-700"
                                                        >
                                                            {replyingTo ===
                                                            message.id
                                                                ? 'Cancel reply'
                                                                : 'Reply'}
                                                        </button>
                                                    )}
                                                    {replyingTo ===
                                                        message.id && (
                                                        <form
                                                            onSubmit={
                                                                handleSubmitReply
                                                            }
                                                            className="mt-3 border-t border-slate-200 pt-3"
                                                        >
                                                            <label
                                                                className="sr-only"
                                                                htmlFor={`reply-${message.id}`}
                                                            >
                                                                Reply to{' '}
                                                                {message.author}
                                                            </label>
                                                            <textarea
                                                                id={`reply-${message.id}`}
                                                                value={
                                                                    replyForm
                                                                        .data
                                                                        .content
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    replyForm.setData(
                                                                        'content',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={`Reply to ${message.author}...`}
                                                                rows={2}
                                                                maxLength={5000}
                                                                className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/10 w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-4"
                                                            />
                                                            {replyForm.errors
                                                                .content && (
                                                                <p className="mt-1 text-xs font-bold text-red-600">
                                                                    {
                                                                        replyForm
                                                                            .errors
                                                                            .content
                                                                    }
                                                                </p>
                                                            )}
                                                            {replyForm.errors
                                                                .parent_message_id && (
                                                                <p className="mt-1 text-xs font-bold text-red-600">
                                                                    {
                                                                        replyForm
                                                                            .errors
                                                                            .parent_message_id
                                                                    }
                                                                </p>
                                                            )}
                                                            <div className="mt-2 flex justify-end">
                                                                <button
                                                                    type="submit"
                                                                    disabled={
                                                                        !replyForm.data.content.trim() ||
                                                                        replyForm.processing
                                                                    }
                                                                    className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                                                >
                                                                    {replyForm.processing
                                                                        ? 'Sending...'
                                                                        : 'Post reply'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </article>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* RIGHT COLUMN: SIDEBAR (issue #5 — no dark activity card; useful only) */}
                        <aside className="space-y-6 lg:col-span-4">
                            {/* AUDIENCE (issue #8) */}
                            <div className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-2 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                    For
                                </h3>
                                <p className="text-sm font-bold text-slate-800">
                                    {announcement.audience || 'All Students'}
                                </p>
                            </div>

                            {/* EVENT BOX (issue #8) — only for Event category */}
                            {isEvent && (
                                <div
                                    className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                    style={{ animationDelay: '0.05s' }}
                                >
                                    <h3 className="mb-3 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                        Event details
                                    </h3>

                                    <div className="mb-3 flex gap-3">
                                        <div className="h-fit min-w-[50px] shrink-0 rounded-lg bg-slate-100 p-2 text-center">
                                            <p className="text-[9px] font-extrabold text-slate-500 uppercase">
                                                {new Date(
                                                    `${announcement.event_date}T00:00:00`,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    { month: 'short' },
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-lg leading-none font-black text-slate-800">
                                                {new Date(
                                                    `${announcement.event_date}T00:00:00`,
                                                ).getDate()}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900">
                                                {formatDate(
                                                    announcement.event_date!,
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                                {formatTime(
                                                    announcement.start_time,
                                                )}
                                                {announcement.end_time &&
                                                    ` – ${formatTime(announcement.end_time)}`}
                                            </p>
                                            {announcement.location && (
                                                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                                    <i className="fa-solid fa-location-dot mr-1"></i>
                                                    {announcement.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        disabled
                                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500"
                                    >
                                        RSVP coming soon
                                    </button>
                                </div>
                            )}

                            {/* RELATED ANNOUNCEMENTS (issue #8) */}
                            <div
                                className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                style={{ animationDelay: '0.1s' }}
                            >
                                <h3 className="mb-4 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                    Related
                                </h3>
                                {relatedAnnouncements.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No related posts found.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {relatedAnnouncements.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/client/announcements/${related.id}`}
                                                className="group block"
                                            >
                                                <p className="group-hover:text-ctu-lightblue line-clamp-2 text-sm font-bold text-slate-700 transition-colors">
                                                    {related.title}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </main>

                {/* ✅ SAME FOOTER AS CLIENT HOME */}
                <footer className="bg-ctu-dark relative z-10 mt-auto border-t border-slate-800 py-6 text-white">
                    <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">
                                &copy; 2026 Cotify · College of Technology
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                About
                            </a>
                            <span>·</span>
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                Contact
                            </a>
                            <span>·</span>
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                Privacy
                            </a>
                        </div>
                    </div>
                </footer>

                {/* Back-to-top with aria-label (accessibility) */}
                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        className="bg-ctu-dark hover:bg-ctu-lightblue animate-fade-in fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:-translate-y-1"
                        aria-label="Scroll back to top"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                )}
            </div>
        </>
    );
}
