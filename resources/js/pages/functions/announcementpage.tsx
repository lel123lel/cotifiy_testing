import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export type Announcement = {
    id: number;
    author_staff_id?: number | null;
    author_admin_id?: number | null;
    is_pinned?: boolean;
    status?: string;
    title: string;
    category: string;
    posted_by: string;
    date: string;
    body: string;
    body_html: string;
    image_url: string | null;
    attachments: { path: string; name: string; url: string; size: string }[];
    event_date: string | null;
    event_end_date?: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

export type AnnouncementPageProps = {
    announcement?: Announcement;
    discussions?: Discussion[];
    announcementComments?: DiscussionMessage[];
    staffMode?: boolean;
    initialTab?: 'announcement' | 'comments';
    onClose?: () => void;
};

type DiscussionMessage = {
    id: number;
    parent_message_id: number | null;
    author: string;
    role: 'Client' | 'Admin' | 'Staff';
    content: string;
    sent_at: string | null;
};

type Discussion = {
    id: number;
    client_name: string;
    messages: DiscussionMessage[];
};

const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

const formatTime = (time: string | null) => {
    if (!time) return undefined;
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    if (!/^\d{2}$/.test(hourText) || !/^\d{2}$/.test(minuteText ?? '') || hour > 23 || Number(minuteText) > 59) {
        return time.slice(0, 5);
    }
    return `${hour % 12 || 12}:${minuteText} ${hour < 12 ? 'AM' : 'PM'}`;
};

export default function AnnouncementPage({
    announcement,
    discussions = [],
    announcementComments = [],
    staffMode = false,
    initialTab = 'announcement',
    onClose,
}: AnnouncementPageProps) {
    const panelBase = staffMode ? '/staff' : '/admin';
    const isModal = Boolean(onClose);
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const articleRef = useRef<HTMLElement>(null);
    
    // Image Zoom State
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    // Reading Progress Logic
    const [readProgress, setReadProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            if (!articleRef.current) return;
            const rect = articleRef.current.getBoundingClientRect();
            const total = rect.height - window.innerHeight * 0.4;
            const scrolled = Math.max(0, -rect.top);
            const pct = total > 0 ? (scrolled / total) * 100 : 0;
            setReadProgress(Math.min(100, Math.max(0, pct)));
        };

        const container = document.getElementById('announcement-modal-scroll');
        if (container) {
            container.addEventListener('scroll', onScroll, { passive: true });
        }
        return () => {
            if (container) container.removeEventListener('scroll', onScroll);
        };
    }, []);

    // Lock body scroll when image zoom is open
    useEffect(() => {
        if (isImageZoomed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isImageZoomed]);

    const [activeTab, setActiveTab] = useState<'announcement' | 'comments'>(initialTab);

    const totalCommentCount =
        discussions.reduce((count, discussion) => count + discussion.messages.length, 0) +
        announcementComments.length;

    if (!announcement) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
                <div>
                    {!isModal && <Head title="Announcement Page" />}
                    <h1 className="text-xl font-bold text-slate-800">No announcement selected</h1>
                    <p className="mt-2 text-sm text-slate-500">Choose an announcement to view its details.</p>
                </div>
            </div>
        );
    }

    const getCategorySpine = (cat: string) => {
        switch (cat) {
            case 'Academic': return 'from-blue-500 to-indigo-500';
            case 'Event': return 'from-emerald-500 to-teal-500';
            case 'Service': return 'from-purple-500 to-fuchsia-500';
            default: return 'from-slate-500 to-slate-400';
        }
    };

    const categoryLabel = announcement.category === 'Event' ? 'Events' : announcement.category === 'Service' ? 'Services' : announcement.category;
    const isEvent = announcement.category === 'Event' && announcement.event_date;
    const referenceNo = `COT-${String(announcement.id).padStart(4, '0')}-${new Date(announcement.date).getFullYear()}`;
    const readingTime = '1 min read';

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.05); } 100% { transform: scale(1); } }
                
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

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

            <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 md:p-6 animate-fade-in" : "min-h-screen bg-slate-50"} role={isModal ? 'dialog' : undefined} aria-modal={isModal || undefined}>
                
                <div className={isModal ? "bg-slate-50 w-full h-full max-w-[1400px] max-h-screen sm:max-h-[95vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in relative" : "w-full max-w-[1400px] mx-auto"}>
                    
                    {/* HEADER & TABS & PROGRESS BAR */}
                    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 relative">
                        <div className="flex items-center gap-4">
                            {isModal && (
                                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors" aria-label="Close">
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                            )}
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight hidden sm:block">Announcement</h2>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {isModal && (
                                <div className="flex gap-1" role="tablist">
                                    <button
                                        role="tab"
                                        onClick={() => setActiveTab('announcement')}
                                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'announcement' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Announcement
                                    </button>
                                    <button
                                        role="tab"
                                        onClick={() => setActiveTab('comments')}
                                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'comments' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Comments <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">{totalCommentCount}</span>
                                    </button>
                                </div>
                            )}
                            
                            {isModal && (
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 ml-2">
                                    <i className="fa-solid fa-xmark text-xl"></i>
                                </button>
                            )}
                        </div>

                        {/* Reading Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
                            <div
                                className={`h-full bg-gradient-to-r ${getCategorySpine(announcement.category)} transition-all duration-150 ease-out`}
                                style={{ width: `${activeTab === 'announcement' ? readProgress : 0}%` }}
                            />
                        </div>
                    </header>

                    {/* SCROLLABLE CONTENT */}
                    <div id="announcement-modal-scroll" className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8">
                        
                        {activeTab === 'announcement' && (
                            <div className="max-w-[1200px] mx-auto animate-slide-up">
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                    
                                    {/* MAIN CONTENT COLUMN */}
                                    <div className={`space-y-6 ${isEvent ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                                        <article ref={articleRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            
                                            {/* CINEMATIC HERO */}
                                            <div className="relative overflow-hidden">
                                                {announcement.image_url && failedImageUrl !== announcement.image_url ? (
                                                    <>
                                                        <img src={announcement.image_url} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40 hero-backdrop" />
                                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-900/60" />
                                                        <div className={`absolute inset-0 bg-gradient-to-tr ${getCategorySpine(announcement.category)} opacity-10 mix-blend-overlay`} />
                                                    </>
                                                ) : (
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${getCategorySpine(announcement.category)} opacity-90`} />
                                                )}

                                                <div className="relative px-6 pt-12 pb-14 sm:px-10 sm:pt-16 sm:pb-20">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                                            {categoryLabel}
                                                        </span>
                                                        {announcement.is_pinned && (
                                                            <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-950">
                                                                Pinned
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
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-xs font-bold text-white backdrop-blur-sm">
                                                                {announcement.posted_by.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-extrabold text-white">{announcement.posted_by}</p>
                                                                <p className="text-[11px] font-medium text-white/60">Author / Office</p>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 w-px bg-white/20" />
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                                            <i className="fa-regular fa-calendar text-white/50"></i> {formatDate(announcement.date)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                                            <i className="fa-regular fa-clock text-white/50"></i> {readingTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BODY CONTENT */}
                                            <div className="px-6 py-10 sm:px-10">
                                                <div className="mx-auto max-w-4xl">
                                                    
                                                    {/* Zoomable Main Image */}
                                                    {announcement.image_url && failedImageUrl !== announcement.image_url && (
                                                        <div 
                                                            className="group relative mx-auto mb-10 inline-flex max-w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-4 cursor-pointer transition-all hover:bg-slate-100"
                                                            onClick={() => setIsImageZoomed(true)}
                                                        >
                                                            <img 
                                                                src={announcement.image_url} 
                                                                alt={announcement.title} 
                                                                className="h-auto w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
                                                                onError={() => setFailedImageUrl(announcement.image_url)} 
                                                            />
                                                            {/* Hover Zoom Icon */}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/5 group-hover:opacity-100">
                                                                <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                                                                    <i className="fa-solid fa-magnifying-glass-plus text-xl text-slate-700"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* HTML Content with Drop Cap */}
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: announcement.body_html }}
                                                        className="article-content mb-12 whitespace-pre-wrap break-words text-[17px] leading-[1.8] text-slate-700 [&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-300 [&_a]:decoration-2 [&_a]:underline-offset-2 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-slate-50 [&_blockquote]:py-2 [&_blockquote]:pl-6 [&_blockquote]:pr-4 [&_blockquote]:italic [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-6 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"
                                                    />

                                                    {/* Attachments */}
                                                    {announcement.attachments && announcement.attachments.length > 0 && (
                                                        <div className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                                            <h4 className="mb-4 text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                                                                Attachments
                                                            </h4>
                                                            <div className="flex flex-wrap gap-3">
                                                                {announcement.attachments.map((file) => (
                                                                    <a key={file.path} href={file.url} download={file.name} className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 transition-all hover:border-blue-400 hover:shadow-sm">
                                                                        <i className={`fa-solid ${
                                                                            file.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-rose-500' :
                                                                            file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? 'fa-file-image text-blue-500' :
                                                                            'fa-file-lines text-slate-500'
                                                                        }`}></i>
                                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">{file.name}</span>
                                                                        <span className="text-xs text-slate-400">{file.size}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    {/* SIDEBAR (Event Details) */}
                                    {isEvent && (
                                        <aside className="space-y-6 lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
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
                                                        {announcement.event_end_date && announcement.event_end_date !== announcement.event_date && (
                                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                                through {formatDate(announcement.event_end_date)}
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                                            {formatTime(announcement.start_time)}
                                                            {announcement.end_time && ` – ${formatTime(announcement.end_time)}`}
                                                        </p>
                                                        {announcement.location && (
                                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                                <i className="fa-solid fa-location-dot mr-1.5"></i> {announcement.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </aside>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* COMMENTS TAB */}
                        {isModal && activeTab === 'comments' && (
                            <div className="max-w-4xl mx-auto animate-slide-up">
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="text-ctu-lightblue flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                                <i className="fa-solid fa-comments"></i>
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-slate-900">Comments</h2>
                                                <p className="text-xs text-slate-500">Announcement-wide discussion and student threads</p>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
                                        <AnnouncementCommentForm announcementId={announcement.id} panelBase={panelBase} />
                                    </div>

                                    <div className="p-4 sm:p-6 space-y-5">
                                        {announcementComments.length > 0 && (
                                            <div className="space-y-3 mb-6">
                                                <h3 className="text-sm font-bold text-slate-700">Announcement-wide discussion</h3>
                                                {announcementComments
                                                    .filter((message) => message.parent_message_id === null)
                                                    .map((message) => (
                                                        <AnnouncementMessageThread
                                                            key={message.id}
                                                            announcementId={announcement.id}
                                                            message={message}
                                                            messages={announcementComments}
                                                            panelBase={panelBase}
                                                        />
                                                    ))}
                                            </div>
                                        )}

                                        {discussions.length === 0 && announcementComments.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                    <i className="fa-regular fa-comment-dots text-xl"></i>
                                                </div>
                                                <h3 className="font-semibold text-slate-800">No comments yet</h3>
                                            </div>
                                        ) : (
                                            discussions.map((discussion) => (
                                                <DiscussionThread key={discussion.id} discussion={discussion} panelBase={panelBase} />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ IMAGE ZOOM MODAL ============ */}
            {isImageZoomed && announcement.image_url && (
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
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="max-h-[90vh] max-w-full rounded-lg object-contain animate-pop-in cursor-default shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

// ============ COMMENT SUB-COMPONENTS ============

function DiscussionThread({ discussion, panelBase }: { discussion: Discussion; panelBase: string }) {
    const rootMessages = discussion.messages.filter((message) => message.parent_message_id === null);
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200">
            <header className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="font-semibold text-slate-900">{discussion.client_name}</h3>
            </header>
            {rootMessages.length === 0 && <p className="p-4 text-sm text-slate-500">No comments yet.</p>}
            <div className="divide-y divide-slate-100">
                {rootMessages.map((message) => (
                    <div key={message.id} className="p-4">
                        <AdminMessageThread discussion={discussion} message={message} panelBase={panelBase} />
                    </div>
                ))}
            </div>
        </article>
    );
}

function AdminMessageThread({ discussion, message, panelBase }: { discussion: Discussion; message: DiscussionMessage; panelBase: string }) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const replies = discussion.messages.filter((reply) => reply.parent_message_id === message.id);

    return (
        <>
            <MessageBubble message={message} />
            <div className="mt-2 ml-4 space-y-3 border-l-2 border-blue-100 pl-4 sm:ml-8">
                <button type="button" onClick={() => setIsReplyOpen((open) => !open)} className="text-ctu-lightblue text-sm font-bold hover:text-blue-700">
                    {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
                {isReplyOpen && <DiscussionReplyForm discussionId={discussion.id} comment={message} panelBase={panelBase} />}
                {replies.map((reply) => (
                    <AdminMessageThread key={reply.id} discussion={discussion} message={reply} panelBase={panelBase} />
                ))}
            </div>
        </>
    );
}

function MessageBubble({ message }: { message: DiscussionMessage }) {
    return (
        <div className={`rounded-xl px-4 py-3 ${message.role !== 'Client' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-slate-50 text-slate-800 border border-slate-200'}`}>
            <p className="mb-1 text-[11px] font-bold tracking-wide uppercase opacity-75">
                {message.role !== 'Client' ? message.role : `${message.author} · Student comment`}
            </p>
            <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            {message.sent_at && (
                <time className="mt-2 block text-[10px] opacity-70" dateTime={message.sent_at}>
                    {new Date(message.sent_at).toLocaleString()}
                </time>
            )}
        </div>
    );
}

function DiscussionReplyForm({ discussionId, comment, panelBase }: { discussionId: number; comment: DiscussionMessage; panelBase: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '', parent_message_id: comment.id });

    const handleReply = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.content.trim() || processing) return;
        post(`${panelBase}/discussions/${discussionId}/messages`, { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={handleReply} className="flex items-end gap-3 mt-3">
            <div className="flex-1">
                <label htmlFor={`reply-${discussionId}-${comment.id}`} className="mb-1 block text-xs font-semibold text-slate-600">
                    {`Reply directly to ${comment.author}'s comment`}
                </label>
                <textarea
                    id={`reply-${discussionId}-${comment.id}`}
                    value={data.content}
                    onChange={(event) => setData('content', event.target.value)}
                    rows={2}
                    maxLength={5000}
                    placeholder={`Reply to ${comment.author}...`}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                {errors.content && <p className="mt-1 text-xs font-semibold text-red-600">{errors.content}</p>}
            </div>
            <button type="submit" disabled={!data.content.trim() || processing} className="bg-ctu-dark rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
                {processing ? 'Posting...' : 'Reply'}
            </button>
        </form>
    );
}

function AnnouncementCommentForm({ announcementId, panelBase }: { announcementId: number; panelBase: string }) {
    return <AnnouncementCommentFormFields announcementId={announcementId} panelBase={panelBase} label="Post a comment for all clients" />;
}

function AnnouncementMessageThread({ announcementId, message, messages, panelBase }: { announcementId: number; message: DiscussionMessage; messages: DiscussionMessage[]; panelBase: string }) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const replies = messages.filter((reply) => reply.parent_message_id === message.id);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-3">
            <MessageBubble message={message} />
            <div className="mt-2 ml-4 border-l-2 border-blue-100 pl-4 sm:ml-8">
                <button type="button" onClick={() => setIsReplyOpen((open) => !open)} className="text-ctu-lightblue text-sm font-bold hover:text-blue-700">
                    {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
                {isReplyOpen && (
                    <AnnouncementCommentFormFields announcementId={announcementId} parentMessageId={message.id} panelBase={panelBase} label={`Reply to ${message.author}`} />
                )}
                {replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {replies.map((reply) => (
                            <AnnouncementMessageThread key={reply.id} announcementId={announcementId} message={reply} messages={messages} panelBase={panelBase} />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

function AnnouncementCommentFormFields({ announcementId, parentMessageId, panelBase, label }: { announcementId: number; parentMessageId?: number; panelBase: string; label: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '', parent_message_id: parentMessageId ?? null });
    const formId = `announcement-comment-${announcementId}-${parentMessageId ?? 'new'}`;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.content.trim() || processing) return;
        post(`${panelBase}/announcements/${announcementId}/comments`, { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3">
            <div className="flex-1">
                <label htmlFor={formId} className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                <textarea
                    id={formId}
                    value={data.content}
                    onChange={(event) => setData('content', event.target.value)}
                    rows={2}
                    maxLength={5000}
                    placeholder="Write a comment..."
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                {errors.content && <p className="mt-1 text-xs font-semibold text-red-600">{errors.content}</p>}
            </div>
            <button type="submit" disabled={!data.content.trim() || processing} className="bg-ctu-dark rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
                {processing ? 'Posting...' : parentMessageId ? 'Reply' : 'Post Comment'}
            </button>
        </form>
    );
}