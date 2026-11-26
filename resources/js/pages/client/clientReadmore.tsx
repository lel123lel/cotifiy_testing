import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by: string;
    posted_by_name: string;
    posted_by_logo?: string | null;
    date: string;
    content: string;
    content_html: string;
    image: string | null;
    is_new?: boolean;
    is_pinned?: boolean;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    reading_time?: string | null;
    has_rsvped?: boolean;
    is_saved?: boolean;
    is_urgent?: boolean;
    is_read?: boolean;
    attachments?: { name: string; url: string; size: string }[] | null;
    // Add albums for the Event Gallery
    albums?: {
        id: number;
        name: string;
        images: string[];
        schedule?: { time: string; title: string; description?: string }[];
    }[] | null;
}

interface DiscussionMessage {
    id: number;
    parent_message_id: number | null;
    author: string;
    author_photo_url?: string | null;
    role: 'Client' | 'Admin' | 'Staff';
    content: string;
    sent_at: string | null;
    is_mine: boolean;
    is_announcement_wide?: boolean;
}

interface ClientReadMoreProps {
    announcement: Announcement;
    messages: DiscussionMessage[];
}

export default function ClientReadMore({
    announcement,
    messages,
}: ClientReadMoreProps) {
    const { auth } = usePage<any>().props;
    const isLoggedIn = auth?.user !== undefined;

    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });
    const replyForm = useForm({
        content: '',
        parent_message_id: null as number | null,
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isSaved, setIsSaved] = useState(announcement.is_saved ?? false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const articleRef = useRef<HTMLElement>(null);

    // Reading progress
    const [readProgress, setReadProgress] = useState(0);

    // Mark-as-read state
    const [hasMarkedRead, setHasMarkedRead] = useState(announcement.is_read ?? false);
    const [readBusy, setReadBusy] = useState(false);

    // Modals
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ name: string; url: string; size: string } | null>(null);
    const [activeAlbum, setActiveAlbum] = useState<{
        id: number;
        name: string;
        images: string[];
        schedule?: { time: string; title: string; description?: string }[];
    } | null>(null);
    const [activeAlbumImage, setActiveAlbumImage] = useState<string | null>(null);

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

    // Scroll tracking
    useEffect(() => {
        const onScroll = () => {
            setShowScrollTop(window.scrollY > 400);

            if (!articleRef.current) return;
            const rect = articleRef.current.getBoundingClientRect();
            const total = rect.height - window.innerHeight * 0.4;
            const scrolled = Math.max(0, -rect.top);
            const pct = total > 0 ? (scrolled / total) * 100 : 0;
            setReadProgress(Math.min(100, Math.max(0, pct)));
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when modals open
    useEffect(() => {
        if (isImageZoomed || previewFile || activeAlbum) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isImageZoomed, previewFile, activeAlbum]);

    const handleMarkRead = () => {
        if (readBusy || hasMarkedRead || !isLoggedIn) return;
        setReadBusy(true);

        router.post(
            `/client/announcements/${announcement.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setHasMarkedRead(true),
                onFinish: () => setReadBusy(false),
            }
        );
    };

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

    const handleToggleSaved = () => {
        const options = {
            preserveScroll: true,
            onSuccess: () => setIsSaved(!isSaved),
        };

        if (isSaved) {
            router.delete(`/client/saved/${announcement.id}`, options);
            return;
        }

        router.post(`/client/saved/${announcement.id}`, {}, options);
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Academic':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getCategorySpine = (cat: string) => {
        switch (cat) {
            case 'Academic': return 'from-blue-500 to-indigo-500';
            case 'Event': return 'from-emerald-500 to-teal-500';
            case 'Service': return 'from-purple-500 to-fuchsia-500';
            default: return 'from-slate-500 to-slate-400';
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

    const referenceNo = `COT-${String(announcement.id).padStart(4, '0')}-${new Date(announcement.date).getFullYear()}`;

    return (
        <>
            <Head title={`${announcement.title} | COTIFY`} />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.05); } 100% { transform: scale(1); } }
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }
                @keyframes move-around-4 { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20vw, 30vh) scale(1.2); } 100% { transform: translate(0, 0) scale(1); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 25s linear infinite; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-read-bounce { animation: readBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                
                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }
                .shape-move-4 { animation: move-around-4 30s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }

                .article-content > p:first-of-type::first-letter {
                    float: left;
                    font-size: 4rem;
                    line-height: 0.8;
                    font-weight: 900;
                    padding-right: 0.5rem;
                    padding-top: 0.35rem;
                    color: #1e40af;
                    font-family: Georgia, 'Times New Roman', serif;
                }

                .hero-backdrop {
                    mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                {/* MOVING SHAPES BACKGROUND */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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

                <ClientNavbar activePage="announcements" announcementTitle={announcement.title} />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    {/* TOP BAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 relative">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Announcement</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                            <ClientNotificationDropdown variant="light" />
                        </div>

                        {/* READING PROGRESS BAR */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
                            <div
                                className={`h-full bg-gradient-to-r ${getCategorySpine(announcement.category)} transition-all duration-150 ease-out`}
                                style={{ width: `${readProgress}%` }}
                            />
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1400px] mx-auto animate-slide-up">
                            
                            {/* BREADCRUMB */}
                            <nav className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Link href="/client" className="hover:text-ctu-lightblue transition-colors rounded">
                                    Home
                                </Link>
                                <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                                <Link href="/client/announcements" className="hover:text-ctu-lightblue transition-colors rounded">
                                    Announcements
                                </Link>
                                <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                                <span className="max-w-[200px] truncate text-slate-700">
                                    {announcement.title}
                                </span>
                            </nav>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                {/* LEFT COLUMN: MAIN CONTENT */}
                                <div className={`space-y-6 ${isEvent ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                                    <article
                                        ref={articleRef}
                                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                    >
                                        
                                        {/* ============ CINEMATIC HERO ============ */}
                                        <div className="relative overflow-hidden">
                                            {announcement.image && (
                                                <>
                                                    <img
                                                        src={announcement.image}
                                                        alt=""
                                                        aria-hidden="true"
                                                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40 hero-backdrop"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-900/60" />
                                                    <div className={`absolute inset-0 bg-gradient-to-tr ${getCategorySpine(announcement.category)} opacity-10 mix-blend-overlay`} />
                                                </>
                                            )}
                                            {!announcement.image && (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${getCategorySpine(announcement.category)} opacity-90`} />
                                            )}

                                            <div className="relative px-6 pt-12 pb-14 sm:px-10 sm:pt-16 sm:pb-20">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                                        {categoryLabel(announcement.category)}
                                                    </span>
                                                    {announcement.is_urgent && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-red-950/30">
                                                            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                                                            Urgent announcement
                                                        </span>
                                                    )}
                                                    {announcement.is_new && (
                                                        <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-950">
                                                            New
                                                        </span>
                                                    )}
                                                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-mono font-bold tracking-widest text-white/80 backdrop-blur-sm">
                                                        {referenceNo}
                                                    </span>
                                                </div>

                                                <h1 className="mt-5 text-3xl font-black leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                                                    {announcement.title}
                                                </h1>

                                                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/80">
                                                    <div className="flex items-center gap-2.5">
                                                        {announcement.posted_by_logo ? (
                                                            <img
                                                                src={announcement.posted_by_logo}
                                                                alt={announcement.posted_by}
                                                                className="h-9 w-9 rounded-full border-2 border-white/40 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-xs font-bold text-white backdrop-blur-sm">
                                                                {announcement.posted_by.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-extrabold text-white">{announcement.posted_by}</p>
                                                            <p className="text-[11px] font-medium text-white/60">{announcement.posted_by_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-8 w-px bg-white/20" />
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                                        <i className="fa-regular fa-calendar text-white/50"></i>
                                                        {formatDate(announcement.date)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                                        <i className="fa-regular fa-clock text-white/50"></i>
                                                        {readingTime}
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleSaved}
                                                        aria-pressed={isSaved}
                                                        className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                                            isSaved
                                                                ? 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
                                                                : 'bg-white text-slate-900 shadow-lg hover:bg-white/90'
                                                        }`}
                                                    >
                                                        <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark`} aria-hidden="true"></i>
                                                        {isSaved ? 'Saved' : 'Save'}
                                                    </button>

                                                    {announcement.is_urgent && (
                                                        <button
                                                            type="button"
                                                            onClick={handleMarkRead}
                                                            disabled={!isLoggedIn || readBusy || hasMarkedRead}
                                                            aria-pressed={hasMarkedRead}
                                                            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                hasMarkedRead
                                                                    ? 'bg-emerald-500 text-white shadow-lg'
                                                                    : 'bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30'
                                                            }`}
                                                        >
                                                            <i className={`fa-solid ${hasMarkedRead ? 'fa-check-double' : 'fa-eye'}`} aria-hidden="true"></i>
                                                            {hasMarkedRead ? 'Marked as Read' : readBusy ? 'Marking…' : 'Mark as Read'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ============ ARTICLE BODY ============ */}
                                        <div className="px-6 py-10 sm:px-10">
                                            <div className="mx-auto max-w-4xl">
                                                
                                                {announcement.image && (
                                                    <div
                                                        className="group relative mx-auto mb-10 flex w-fit max-w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-4 cursor-pointer transition-all hover:bg-slate-100"
                                                        onClick={() => setIsImageZoomed(true)}
                                                    >
                                                        <img
                                                            src={announcement.image}
                                                            alt={announcement.title}
                                                            className="h-auto w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/5 group-hover:opacity-100">
                                                            <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                                                                <i className="fa-solid fa-magnifying-glass-plus text-xl text-slate-700"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {!announcement.image && (
                                                    <div className="mb-10 flex h-64 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 sm:h-80">
                                                        <i className={`mb-3 text-5xl ${
                                                                announcement.category === 'Academic' ? 'fa-solid fa-graduation-cap'
                                                                : announcement.category === 'Event' ? 'fa-regular fa-calendar'
                                                                : announcement.category === 'Service' ? 'fa-solid fa-hand-holding-heart'
                                                                : 'fa-regular fa-newspaper'
                                                            }`}
                                                        ></i>
                                                        <span className="text-sm font-bold tracking-widest uppercase">
                                                            {categoryLabel(announcement.category)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: announcement.content_html }}
                                                        className="article-content mb-12 whitespace-pre-wrap break-words text-[17px] leading-[1.8] text-slate-700 [&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-300 [&_a]:decoration-2 [&_a]:underline-offset-2 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-slate-50 [&_blockquote]:py-2 [&_blockquote]:pl-6 [&_blockquote]:pr-4 [&_blockquote]:italic [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-6 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-5 [&_pre]:text-slate-100 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"
                                                    />

                                                    {announcement.attachments && announcement.attachments.length > 0 && (
                                                        <div className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                                            <h4 className="mb-4 text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                                                                Attachments
                                                            </h4>
                                                            <div className="flex flex-wrap gap-3">
                                                                {announcement.attachments.map((file, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setPreviewFile(file)}
                                                                        className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 transition-all hover:border-blue-400 hover:shadow-sm text-left"
                                                                    >
                                                                        <i className={`fa-solid ${
                                                                            file.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-rose-500' :
                                                                            file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? 'fa-file-image text-blue-500' :
                                                                            'fa-file-lines text-slate-500'
                                                                        }`}></i>
                                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                                                                            {file.name}
                                                                        </span>
                                                                        <span className="text-xs text-slate-400">
                                                                            {file.size}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ANNOUNCEMENT DISCUSSION */}
                                                <div ref={commentsRef} className="mt-12 border-t border-slate-200 pt-10">
                                                    <div className="mb-8">
                                                        <h3 className="text-2xl font-extrabold text-slate-900">
                                                            Comments & discussion
                                                        </h3>
                                                        <p className="mt-2 text-base font-medium text-slate-500">
                                                            Ask a question or join the discussion about this announcement.
                                                        </p>
                                                    </div>

                                                    {isLoggedIn ? (
                                                        <form onSubmit={handleSubmitQuestion} className="mb-10">
                                                            <textarea
                                                                value={data.content}
                                                                onChange={(e) => setData('content', e.target.value)}
                                                                placeholder="Write a comment..."
                                                                rows={3}
                                                                maxLength={5000}
                                                                className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-base font-medium shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                            />
                                                            {errors.content && (
                                                                <p className="mt-1.5 text-sm font-bold text-red-600">{errors.content}</p>
                                                            )}
                                                            
                                                            <div className="mt-3 flex items-center justify-between">
                                                                <span className="text-xs font-semibold text-slate-400">
                                                                    {data.content.length} / 5000
                                                                </span>
                                                                <div className="flex items-center gap-4">
                                                                    {!data.content.trim() && (
                                                                        <span className="text-xs font-semibold text-slate-400">
                                                                            Write something first
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!data.content.trim() || processing}
                                                                        className={`rounded-lg px-6 py-2.5 text-sm font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                                            !data.content.trim() || processing
                                                                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                        }`}
                                                                    >
                                                                        {processing ? 'Posting...' : 'Post comment'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                                                            <p className="mb-3 text-base font-bold text-slate-700">
                                                                Log in to join the discussion.
                                                            </p>
                                                            <Link
                                                                href="/auth/login"
                                                                className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                                                            >
                                                                Log In
                                                            </Link>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4" aria-live="polite">
                                                        {messages.length === 0 ? (
                                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                                                                <i className="fa-regular fa-comments mb-3 text-3xl text-slate-400" aria-hidden="true"></i>
                                                                <p className="text-base font-semibold text-slate-600">No comments yet</p>
                                                                <p className="mt-1 text-sm text-slate-500">Be the first to start the discussion.</p>
                                                            </div>
                                                        ) : (
                                                            messages.map((message) => {
                                                                const parentMessage = message.parent_message_id
                                                                    ? messages.find((candidate) => candidate.id === message.parent_message_id)
                                                                    : null;
                                                                let messageDepth = 0;
                                                                let ancestorId = message.parent_message_id;
                                                                const visitedIds = new Set([message.id]);

                                                                while (ancestorId !== null && !visitedIds.has(ancestorId)) {
                                                                    const ancestor = messages.find((candidate) => candidate.id === ancestorId);
                                                                    if (!ancestor) break;

                                                                    visitedIds.add(ancestor.id);
                                                                    messageDepth += 1;
                                                                    ancestorId = ancestor.parent_message_id;
                                                                }

                                                                return (
                                                                <div
                                                                    key={message.id}
                                                                    style={parentMessage ? { marginLeft: `${messageDepth * 16}px` } : undefined}
                                                                >
                                                                    {parentMessage && (
                                                                        <a
                                                                            href={`#comment-${parentMessage.id}`}
                                                                            className="relative mb-1 flex min-h-6 items-center gap-2 pl-4 text-xs text-slate-500 before:absolute before:top-0 before:bottom-0 before:left-0 before:border-l-2 before:border-blue-200 after:absolute after:bottom-1 after:left-0 after:w-3 after:border-t-2 after:border-blue-200 hover:text-blue-700"
                                                                        >
                                                                            <i className="fa-solid fa-reply text-blue-400" aria-hidden="true"></i>
                                                                            <span className="shrink-0">Replying to <strong className="font-bold text-slate-700">{parentMessage.author}</strong>:</span>
                                                                            <span className="min-w-0 truncate">{parentMessage.content}</span>
                                                                        </a>
                                                                    )}
                                                                    <article
                                                                    id={`comment-${message.id}`}
                                                                    className={`scroll-mt-24 rounded-xl border p-5 ${
                                                                        message.role !== 'Client'
                                                                            ? 'border-blue-200 bg-blue-50/50'
                                                                            : 'border-slate-200 bg-white'
                                                                    }`}
                                                                    >
                                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                                        {message.author_photo_url ? (
                                                                            <img
                                                                                src={message.author_photo_url}
                                                                                alt=""
                                                                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                                                                                {message.author.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <span className="text-sm font-bold text-slate-900">
                                                                            {message.author}
                                                                        </span>
                                                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                                                message.role !== 'Client'
                                                                                    ? 'bg-blue-100 text-blue-700'
                                                                                    : 'bg-slate-100 text-slate-600'
                                                                            }`}
                                                                        >
                                                                            {message.role === 'Admin' ? announcement.posted_by : message.role}
                                                                        </span>
                                                                        {message.is_announcement_wide && (
                                                                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                                                                All clients
                                                                            </span>
                                                                        )}
                                                                        {message.is_mine && (
                                                                            <span className="text-xs font-semibold text-slate-400">You</span>
                                                                        )}
                                                                        {message.sent_at && (
                                                                            <time className="ml-auto text-xs font-medium text-slate-400" dateTime={message.sent_at}>
                                                                                {new Date(message.sent_at).toLocaleString()}
                                                                            </time>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-base leading-relaxed break-words whitespace-pre-wrap text-slate-700">
                                                                        {message.content}
                                                                    </p>
                                                                    
                                                                    {isLoggedIn && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (replyingTo === message.id) {
                                                                                    setReplyingTo(null);
                                                                                    replyForm.reset();
                                                                                    replyForm.clearErrors();
                                                                                    return;
                                                                                }
                                                                                setReplyingTo(message.id);
                                                                                replyForm.setData({
                                                                                    content: '',
                                                                                    parent_message_id: message.id,
                                                                                });
                                                                                replyForm.clearErrors();
                                                                            }}
                                                                            className="mt-3 rounded text-sm font-bold text-blue-600 transition hover:text-blue-800"
                                                                        >
                                                                            {replyingTo === message.id ? 'Cancel reply' : 'Reply'}
                                                                        </button>
                                                                    )}
                                                                    
                                                                    {replyingTo === message.id && (
                                                                        <form onSubmit={handleSubmitReply} className="mt-4 border-t border-slate-200/60 pt-4">
                                                                            <label className="sr-only" htmlFor={`reply-${message.id}`}>
                                                                                Reply to {message.author}
                                                                            </label>
                                                                            <textarea
                                                                                id={`reply-${message.id}`}
                                                                                value={replyForm.data.content}
                                                                                onChange={(event) => replyForm.setData('content', event.target.value)}
                                                                                placeholder={`Reply to ${message.author}...`}
                                                                                rows={2}
                                                                                maxLength={5000}
                                                                                className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                                            />
                                                                            {replyForm.errors.content && (
                                                                                <p className="mt-1.5 text-xs font-bold text-red-600">{replyForm.errors.content}</p>
                                                                            )}
                                                                            <div className="mt-3 flex justify-end">
                                                                                <button
                                                                                    type="submit"
                                                                                    disabled={!replyForm.data.content.trim() || replyForm.processing}
                                                                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                                                                >
                                                                                    {replyForm.processing ? 'Posting...' : 'Post reply'}
                                                                                </button>
                                                                            </div>
                                                                        </form>
                                                                    )}
                                                                    </article>
                                                                </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </article>
                                </div>

                                {/* RIGHT COLUMN: SIDEBAR */}
                                {isEvent && (
                                    <aside className="space-y-6 lg:col-span-4">
                                        <div className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                            <h3 className="mb-4 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                                Event details
                                            </h3>

                                            <div className="mb-5 flex gap-4">
                                                <div className="h-fit min-w-[56px] shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-center">
                                                    <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                                                        {new Date(`${announcement.event_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                                                    </p>
                                                    <p className="mt-0.5 text-xl leading-none font-black text-slate-800">
                                                        {new Date(`${announcement.event_date}T00:00:00`).getDate()}
                                                    </p>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base font-bold text-slate-900">
                                                        {formatDate(announcement.event_date!)}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                                        {formatTime(announcement.start_time)}
                                                        {announcement.end_time && ` – ${formatTime(announcement.end_time)}`}
                                                    </p>
                                                    {announcement.location && (
                                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                                            <i className="fa-solid fa-location-dot mr-1.5"></i>
                                                            {announcement.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                        {announcement.albums && announcement.albums.length > 0 && (
                                            <section className="mt-6 border-t border-slate-200 pt-6">
                                                <div className="mb-5">
                                                    <h3 className="text-xl font-extrabold text-slate-900">Event Gallery</h3>
                                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                                        Relive the moments from this event.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    {announcement.albums.slice(0, 3).map((album) => (
                                                        <div
                                                            key={album.id}
                                                            onClick={() => setActiveAlbum(album)}
                                                            className="group relative flex aspect-[4/3] cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-all hover:shadow-md"
                                                        >
                                                            {album.images.length > 0 ? (
                                                                <img
                                                                    src={album.images[0]}
                                                                    alt={album.name}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                                    <i className="fa-regular fa-images text-4xl"></i>
                                                                </div>
                                                            )}

                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                                <p className="truncate text-lg font-bold text-white drop-shadow-sm">{album.name}</p>
                                                                <p className="text-xs font-semibold text-white/80">
                                                                    {album.images.length} photos
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </aside>
                                )}
                            </div>
                        </div>
                    </main>
                </div>

                {/* Back-to-top */}
                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-ctu-dark hover:bg-ctu-lightblue animate-fade-in fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:-translate-y-1"
                        aria-label="Scroll back to top"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                )}

                {/* ============ ALBUM VIEW MODAL ============ */}
                {activeAlbum && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-fade-in"
                        onClick={() => { setActiveAlbum(null); setActiveAlbumImage(null); }}
                    >
                        <div 
                            className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-pop-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">{activeAlbum.name}</h3>
                                    <p className="text-sm text-slate-500">{activeAlbum.images ? activeAlbum.images.length : 0} photos</p>
                                </div>
                                <button 
                                    onClick={() => { setActiveAlbum(null); setActiveAlbumImage(null); }} 
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <i className="fa-solid fa-xmark text-xl"></i>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
                                {activeAlbum.images && activeAlbum.images.length > 0 ? (
                                    <div className="relative ml-4 space-y-8 border-l border-slate-300 pb-8 sm:ml-6">
                                        {activeAlbum.images.map((img, idx) => (
                                            <div key={idx} className="relative pl-8 sm:pl-10">
                                                {/* Timeline Dot */}
                                                <span className="absolute left-0 top-2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-ctu-lightblue bg-white text-[10px] font-bold text-ctu-lightblue shadow-sm">
                                                    {idx + 1}
                                                </span>

                                                {/* Image Card */}
                                                <div
                                                    onClick={() => setActiveAlbumImage(img)}
                                                    className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                        <img
                                                            src={img}
                                                            alt={`Photo ${idx + 1}`}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                                                            <i className="fa-solid fa-expand text-3xl text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100"></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-slate-100 bg-white p-3">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Photo {idx + 1}</span>
                                                        <span className="text-[10px] font-semibold text-slate-400">Click to expand</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                        <i className="fa-regular fa-images mb-4 text-5xl text-slate-300"></i>
                                        <p className="text-lg font-bold text-slate-600">No images in this album</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ ALBUM IMAGE ZOOM MODAL ============ */}
                {activeAlbumImage && (
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in cursor-zoom-out"
                        onClick={() => setActiveAlbumImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 z-10"
                            onClick={(e) => { e.stopPropagation(); setActiveAlbumImage(null); }}
                            aria-label="Close image"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                        <img
                            src={activeAlbumImage}
                            alt="Zoomed album image"
                            className="max-h-[90vh] max-w-full rounded-lg object-contain animate-pop-in cursor-default shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* IMAGE ZOOM MODAL (Main Cover) */}
                {isImageZoomed && announcement.image && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
                        onClick={() => setIsImageZoomed(false)}
                    >
                        <button
                            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 z-10"
                            onClick={() => setIsImageZoomed(false)}
                            aria-label="Close image"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                        <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="max-h-[90vh] max-w-full rounded-lg object-contain animate-pop-in cursor-default shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* FILE PREVIEW MODAL */}
                {previewFile && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md animate-fade-in"
                        onClick={() => setPreviewFile(null)}
                    >
                        <div
                            className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-pop-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <i className={`fa-solid ${
                                            previewFile.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-rose-500' :
                                            previewFile.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? 'fa-file-image text-blue-500' :
                                            'fa-file-lines text-slate-500'
                                        }`}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-900">{previewFile.name}</p>
                                        <p className="text-xs text-slate-500">{previewFile.size}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <a
                                        href={previewFile.url}
                                        download={previewFile.name}
                                        className="hidden sm:flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                    >
                                        <i className="fa-solid fa-download"></i>
                                        Download
                                    </a>
                                    <a
                                        href={previewFile.url}
                                        download={previewFile.name}
                                        className="flex sm:hidden h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                                        aria-label="Download file"
                                    >
                                        <i className="fa-solid fa-download"></i>
                                    </a>
                                    <button
                                        onClick={() => setPreviewFile(null)}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <i className="fa-solid fa-xmark text-xl"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-6 flex items-center justify-center">
                                {previewFile.name.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={`${previewFile.url}#toolbar=0`}
                                        className="h-full w-full rounded-lg border border-slate-300 bg-white shadow-sm"
                                        title={previewFile.name}
                                    />
                                ) : previewFile.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <img
                                        src={previewFile.url}
                                        alt={previewFile.name}
                                        className="max-h-full max-w-full rounded-lg object-contain shadow-sm bg-white"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm border border-slate-200 w-full max-w-md">
                                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                                            <i className="fa-solid fa-file-circle-question text-3xl"></i>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-slate-900 mb-2">Preview not available</h3>
                                        <p className="text-sm text-slate-500 mb-6">
                                            This file type cannot be previewed directly in the browser. You can download it to view its contents.
                                        </p>
                                        <a
                                            href={previewFile.url}
                                            download={previewFile.name}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 w-full justify-center"
                                        >
                                            <i className="fa-solid fa-download"></i>
                                            Download File
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            <div className="border-t border-slate-200 bg-white p-4 sm:hidden">
                                <a
                                    href={previewFile.url}
                                    download={previewFile.name}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                                >
                                    <i className="fa-solid fa-download"></i>
                                    Download {previewFile.name}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}