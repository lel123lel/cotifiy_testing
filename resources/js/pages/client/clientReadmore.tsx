import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [rsvped, setRsvped] = useState<boolean>(announcement.has_rsvped ?? false);
    const commentsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const hasTrackedRead = useRef(false);

    // Public answers only (offices mark FAQ answers as public)
    const publicAnswers = useMemo(
        () => messages.filter((m) => m.role === 'Admin' && m.parent_message_id === null),
        [messages],
    );

    // Issue #3 (check): marks as read when opened — fire once, silently
    useEffect(() => {
        if (hasTrackedRead.current) return;
        hasTrackedRead.current = true;
        router.post(`/client/announcements/${announcement.id}/read`, {}, { preserveScroll: true, showProgress: false });
    }, [announcement.id]);

    // Polling for new answers
    useEffect(() => {
        let timeout: number;
        let isMounted = true;
        const reloadMessages = () => {
            router.reload({
                only: ['messages'],
                showProgress: false,
                onFinish: () => {
                    if (isMounted) timeout = window.setTimeout(reloadMessages, 5000);
                },
            });
        };
        timeout = window.setTimeout(reloadMessages, 5000);
        return () => { isMounted = false; window.clearTimeout(timeout); };
    }, []);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!isProfileOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsProfileOpen(false); };
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

    const handleRsvp = () => {
        if (announcement.category !== 'Event') return;
        setRsvped((v) => !v);
        router.post(`/client/events/${announcement.id}/rsvp`, {}, {
            preserveScroll: true,
            showProgress: false,
            onError: () => setRsvped((v) => !v), // rollback on failure
        });
    };

    // ✅ Same as ClientHome
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Academic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const categoryLabel = (cat: string) =>
        cat === 'Event' ? 'Events' : cat === 'Academic' ? 'Academic' : cat === 'Service' ? 'Services' : 'General';

    const formatDate = (date: string) =>
        new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    const formatTime = (time: string | null) =>
        time ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';

    const readingTime = announcement.reading_time || '1 min read';
    const isEvent = announcement.category === 'Event' && announcement.event_date;

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

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">

                {/* ✅ SAME MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/10 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/10 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                </div>

                {/* ✅ SAME DARK HEADER AS CLIENT HOME */}
                <header className="relative z-50 bg-ctu-dark/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

                            <div className="flex items-center gap-8">
                                <Link href="/client" className="flex items-center shrink-0">
                                    <img src="/images/3rdLogo.png" alt="Cotify" className="w-10 h-10 sm:w-12 sm:h-12 object-contain -ml-1 -mr-3" />
                                    <span className="font-extrabold text-xl text-white hidden sm:block">Cotify</span>
                                </Link>

                                <nav className="hidden md:flex items-center gap-6">
                                    <Link href="/client" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Home</Link>
                                    <Link href="/announcements" className="text-sm font-bold text-white border-b-2 border-ctu-lightblue pb-1">Announcements</Link>
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

                                <div className="relative" ref={profileRef}>
                                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-700 cursor-pointer group">
                                        <div className="w-8 h-8 rounded-full bg-ctu-lightblue text-white flex items-center justify-center font-bold text-sm">
                                            {currentUser.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-white hidden lg:block">{currentUser.split(' ')[0]} D.</span>
                                        <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                                            <div className="p-2">
                                                <Link href="/client/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors">
                                                    <i className="fa-regular fa-user w-4 text-center"></i> My Profile
                                                </Link>
                                                <Link href="/client/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ctu-lightblue transition-colors">
                                                    <i className="fa-solid fa-gear w-4 text-center"></i> Settings
                                                </Link>
                                                <hr className="my-2 border-slate-100" />
                                                <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Log Out
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                    {/* BREADCRUMB (issue #3 — replaces header "Back") */}
                    <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 animate-fade-in">
                        <Link href="/client" className="hover:text-ctu-lightblue transition-colors">Home</Link>
                        <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                        <Link href="/announcements" className="hover:text-ctu-lightblue transition-colors">Announcements</Link>
                        <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                        <span className="text-slate-700 truncate max-w-[200px]">{announcement.title}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: MAIN CONTENT */}
                        <div className="lg:col-span-8 space-y-6">
                            <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 animate-slide-up">

                                {/* TITLE + SINGLE BYLINE (issue #4 — one byline, no Quick Info card) */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${getCategoryColor(announcement.category)}`}>
                                                {categoryLabel(announcement.category)}
                                            </span>
                                            {announcement.is_new && (
                                                <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                                            )}
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                                            {announcement.title}
                                        </h1>

                                        {/* Byline: office · date · reading time (issue #4, #6 — avatar from office) */}
                                        <div className="flex items-center gap-3 mt-5">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 overflow-hidden">
                                                {announcement.posted_by_logo ? (
                                                    <img src={announcement.posted_by_logo} alt={announcement.posted_by} className="w-full h-full object-cover" />
                                                ) : (
                                                    announcement.posted_by.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-extrabold text-slate-900">{announcement.posted_by}</p>
                                                <p className="text-xs font-medium text-slate-500">
                                                    {formatDate(announcement.date)} · {readingTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save (dark) + Share (outline) — kept good pattern from audit */}
                                    <div className="flex sm:flex-col gap-2 shrink-0">
                                        <button type="button" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                                            <i className="fa-regular fa-bookmark"></i> Save
                                        </button>
                                        <button type="button" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                            <i className="fa-solid fa-link"></i> Copy link
                                        </button>
                                    </div>
                                </div>

                                {/* COVER IMAGE — title above (no contrast issue); default banner per category (issue #7 fix pattern) */}
                                <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 mb-8 flex items-center justify-center relative bg-gradient-to-br from-slate-100 to-slate-200">
                                    {announcement.image ? (
                                        <img src={announcement.image} alt={announcement.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <i className={`text-5xl mb-3 ${
                                                announcement.category === 'Academic' ? 'fa-solid fa-graduation-cap' :
                                                announcement.category === 'Event' ? 'fa-regular fa-calendar' :
                                                announcement.category === 'Service' ? 'fa-solid fa-hand-holding-heart' :
                                                'fa-regular fa-newspaper'
                                            }`}></i>
                                            <span className="text-xs font-bold uppercase tracking-widest">{categoryLabel(announcement.category)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* BODY */}
                                <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line mb-8">
                                    {announcement.content}
                                </div>

                                {/* ATTACHMENTS (issue #8) */}
                                {announcement.attachments && announcement.attachments.length > 0 && (
                                    <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                        <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Attachments</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {announcement.attachments.map((file, idx) => (
                                                <a key={idx} href={file.url} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:border-ctu-lightblue hover:shadow-sm transition-all group">
                                                    <i className="fa-solid fa-file-pdf text-rose-500"></i>
                                                    <span className="text-xs font-bold text-slate-700 group-hover:text-ctu-lightblue">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400">{file.size}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ASK THE OFFICE (issue #2 — renamed, single purpose) */}
                                <div ref={commentsRef} className="mt-10 pt-8 border-t border-slate-200">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-extrabold text-slate-900">Ask the {announcement.posted_by}</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-1">
                                            Only the office sees your question. Answers useful to everyone are shown below.
                                        </p>
                                    </div>

                                    {isLoggedIn ? (
                                        <form onSubmit={handleSubmitQuestion} className="mb-8">
                                            <textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                placeholder="Type your question..."
                                                rows={2}
                                                maxLength={1000}
                                                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all resize-none shadow-sm"
                                            />
                                            {errors.content && <p className="mt-1 text-xs font-bold text-red-600">{errors.content}</p>}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[11px] font-semibold text-slate-400">{data.content.length} / 1000</span>
                                                <div className="flex items-center gap-3">
                                                    {/* Accessibility: show why disabled */}
                                                    {!data.content.trim() && (
                                                        <span className="text-[11px] font-semibold text-slate-400">Write something first</span>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={!data.content.trim() || processing}
                                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                                                            !data.content.trim() || processing
                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                : 'bg-slate-800 text-white hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {processing ? 'Sending...' : 'Send question'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                            <p className="text-sm font-bold text-slate-700 mb-2">Log in to ask a question.</p>
                                            <Link href="/auth/login" className="inline-block px-5 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm">
                                                Log In
                                            </Link>
                                        </div>
                                    )}

                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">
                                        Public answers ({publicAnswers.length})
                                    </h4>
                                    <div className="space-y-4">
                                        {publicAnswers.length === 0 ? (
                                            <p className="text-sm font-medium text-slate-500 italic">No public answers yet.</p>
                                        ) : (
                                            publicAnswers.map((answer) => {
                                                const question = messages.find(m => m.id === answer.parent_message_id);
                                                return (
                                                    <div key={answer.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        {question && (
                                                            <p className="text-xs font-bold text-slate-800 mb-2">Q: {question.content}</p>
                                                        )}
                                                        <div className="flex gap-2 items-start">
                                                            <i className="fa-solid fa-reply text-slate-400 mt-1"></i>
                                                            <div>
                                                                <p className="text-sm text-slate-700 font-medium">{answer.content}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 mt-1">- {announcement.posted_by}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* RIGHT COLUMN: SIDEBAR (issue #5 — no dark activity card; useful only) */}
                        <aside className="lg:col-span-4 space-y-6">

                            {/* AUDIENCE (issue #8) */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up">
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">For</h3>
                                <p className="text-sm font-bold text-slate-800">
                                    {announcement.audience || 'All Students'}
                                </p>
                            </div>

                            {/* EVENT BOX (issue #8) — only for Event category */}
                            {isEvent && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Event details</h3>

                                    <div className="flex gap-3 mb-3">
                                        <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[50px] shrink-0 h-fit">
                                            <p className="text-[9px] font-extrabold uppercase text-slate-500">
                                                {new Date(`${announcement.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                                            </p>
                                            <p className="text-lg font-black leading-none mt-0.5 text-slate-800">
                                                {new Date(`${announcement.event_date}T00:00:00`).getDate()}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900">{formatDate(announcement.event_date!)}</p>
                                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                                {formatTime(announcement.start_time)}
                                                {announcement.end_time && ` – ${formatTime(announcement.end_time)}`}
                                            </p>
                                            {announcement.location && (
                                                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                                    <i className="fa-solid fa-location-dot mr-1"></i>
                                                    {announcement.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRsvp}
                                        className={`w-full px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                                            rsvped
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {rsvped ? (
                                            <><i className="fa-solid fa-check mr-1"></i> I'm going</>
                                        ) : (
                                            "I'm going"
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* RELATED ANNOUNCEMENTS (issue #8) */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Related</h3>
                                {relatedAnnouncements.length === 0 ? (
                                    <p className="text-sm text-slate-500">No related posts found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {relatedAnnouncements.map(related => (
                                            <Link key={related.id} href={`/client/announcements/${related.id}`} className="block group">
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-ctu-lightblue transition-colors line-clamp-2">{related.title}</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </main>

                {/* ✅ SAME FOOTER AS CLIENT HOME */}
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

                {/* Back-to-top with aria-label (accessibility) */}
                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-ctu-dark hover:bg-ctu-lightblue text-white shadow-2xl flex items-center justify-center transition-all animate-fade-in hover:-translate-y-1"
                        aria-label="Scroll back to top"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                )}
            </div>
        </>
    );
}