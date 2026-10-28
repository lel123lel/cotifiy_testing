import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

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
}

export default function AnnouncementDetails({ announcement, messages }: AnnouncementDetailsProps) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '' });
    const comments = messages.filter(
        (message) => message.role === 'Client' && message.parent_message_id === null,
    );
    const unthreadedReplies = messages.filter(
        (message) => message.role === 'Admin' && message.parent_message_id === null,
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

    const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.content.trim() || processing) return;

        post(`/client/announcements/${announcement.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
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

    const formatTime = (time: string | null): string => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : 'Time TBA';

    return (
        <>
            <Head title={`${announcement.title} | COTIFY`} />
            
            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen">

                {/* HEADER */}
                <header className="fixed top-0 left-0 right-0 z-40 bg-ctu-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <Link href="/client/clientpage" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                                    <i className="fa-solid fa-gear text-ctu-dark text-lg"></i>
                                </div>
                                <div>
                                    <h1 className="font-extrabold text-white text-lg leading-tight tracking-tight">COTIFY</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College of Technology</p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-4">
                                <Link
                                    href="/client/clientpage"
                                    className="text-sm font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                                >
                                    <i className="fa-solid fa-arrow-left text-xs"></i> Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Article Card */}
                    <article className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        
                        {/* Hero Image */}
                        <div className="h-80 sm:h-[400px] w-full relative">
                            <img 
                                src={announcement.image ?? '/images/download.jpg'} 
                                alt={announcement.title} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-md ${getBadgeClass(announcement.category)}`}>
                                    {announcement.category}
                                </span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 sm:p-12">
                            
                            {/* Title & Date */}
                            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                                {announcement.title}
                            </h1>
                            
                            {/* Meta Details (Author, Date, Time, Location) */}
                            <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-ctu-lightblue border border-blue-100">
                                        <i className="fa-solid fa-building text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted by</p>
                                        <p className="text-sm font-extrabold text-slate-800">{announcement.posted_by}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                        <i className="fa-regular fa-calendar text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Posted</p>
                                        <p className="text-sm font-extrabold text-slate-800">{formatDate(announcement.date)}</p>
                                    </div>
                                </div>

                                {announcement.event_date && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                            <i className="fa-regular fa-clock text-lg"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event schedule</p>
                                            <p className="text-sm font-extrabold text-slate-800">
                                                {formatDate(announcement.event_date)} · {announcement.start_time && announcement.end_time
                                                    ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
                                                    : formatTime(announcement.start_time)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {announcement.location && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                            <i className="fa-solid fa-location-dot text-lg"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                            <p className="text-sm font-extrabold text-slate-800">{announcement.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Main Body */}
                            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed font-medium whitespace-pre-line mb-12">
                                {announcement.content}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-100">
                                <button className="bg-ctu-dark hover:bg-slate-800 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2 hover:-translate-y-0.5">
                                    <i className="fa-regular fa-bookmark"></i> Save Article
                                </button>
                                <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                                    <i className="fa-solid fa-share-nodes"></i> Share
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Comments and replies */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-10">
                        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-ctu-lightblue">
                                    <i className="fa-solid fa-comments text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Comments & Replies</h3>
                                    <p className="text-sm font-semibold text-slate-500 mt-1">Leave a comment or concern about this announcement. The admin team can reply here.</p>
                                </div>
                            </div>
                            <span className="bg-blue-100 text-ctu-lightblue text-sm font-extrabold px-4 py-2 rounded-xl border border-blue-200">{comments.length} Comments</span>
                        </div>

                        <div className="p-8 space-y-6 bg-white max-h-[32rem] overflow-y-auto">
                            {comments.length === 0 && (
                                <p className="text-center text-sm font-medium text-slate-500 py-8">
                                    No comments yet. Be the first to share a comment or concern.
                                </p>
                            )}
                            {comments.map((comment) => (
                                <article key={comment.id} className="rounded-2xl border border-slate-100 p-5">
                                    <ClientMessageCard message={comment} />
                                    {messages.some((message) => message.parent_message_id === comment.id) && (
                                        <div className="ml-4 mt-5 space-y-4 border-l-2 border-blue-100 pl-4 sm:ml-8">
                                            {messages
                                                .filter((message) => message.parent_message_id === comment.id)
                                                .map((reply) => (
                                                    <ClientMessageCard key={reply.id} message={reply} />
                                                ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                            {unthreadedReplies.length > 0 && (
                                <section className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                                    <h4 className="text-sm font-bold text-slate-700">Earlier admin replies</h4>
                                    {unthreadedReplies.map((reply) => (
                                        <ClientMessageCard key={reply.id} message={reply} />
                                    ))}
                                </section>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-200">
                            <form onSubmit={handleSubmitComment} className="relative flex items-end gap-4">
                                <div className="relative flex-1">
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Share a comment or concern about this announcement..."
                                        rows={3}
                                        maxLength={5000}
                                        className="w-full p-5 bg-white border border-slate-300 rounded-2xl text-base font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all resize-none shadow-sm"
                                    />
                                    {errors.content && <p className="mt-2 text-sm font-semibold text-red-600">{errors.content}</p>}
                                </div>
                                <button type="submit" disabled={!data.content.trim() || processing} className="h-14 px-8 rounded-2xl bg-ctu-lightblue text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-ctu-lightblue/30 shrink-0 hover:-translate-y-0.5 font-bold gap-2">
                                    {processing ? 'Posting...' : 'Post Comment'} <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
                
                {/* SIMPLE FOOTER */}
                <footer className="bg-ctu-dark text-white mt-10 border-t border-slate-800 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                                <i className="fa-solid fa-gear text-ctu-dark text-lg"></i>
                            </div>
                            <h1 className="font-extrabold text-white text-lg leading-tight tracking-tight">COTIFY</h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function ClientMessageCard({ message }: { message: DiscussionMessage }) {
    return (
        <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full ${message.role === 'Admin' ? 'bg-blue-600' : 'bg-emerald-500'} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md`}>
                {message.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="font-bold text-base text-slate-900">{message.author}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">
                        {message.role === 'Admin' ? 'Admin reply' : 'Your comment'}
                    </span>
                    {message.sent_at && (
                        <time className="text-xs font-semibold text-slate-400" dateTime={message.sent_at}>
                            {new Date(message.sent_at).toLocaleString()}
                        </time>
                    )}
                </div>
                <div className={`w-full p-5 rounded-2xl text-left text-base font-medium leading-relaxed whitespace-pre-wrap break-words ${
                    message.role === 'Admin'
                        ? 'bg-blue-50 text-blue-900 border border-blue-100'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                }`}>
                    {message.content}
                </div>
            </div>
        </div>
    );
}