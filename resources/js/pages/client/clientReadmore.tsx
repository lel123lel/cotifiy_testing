import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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

interface AnnouncementDetailsProps {
    announcement: Announcement;
    userName?: string;
}

export default function AnnouncementDetails({ announcement, userName = 'Guest' }: AnnouncementDetailsProps) {
    // DISCUSSION STATE
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

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentToAdd: Comment = {
            id: Date.now(),
            author: userName,
            role: 'Student',
            avatarColor: 'bg-emerald-500',
            text: newComment.trim(),
            time: 'Just now'
        };

        setComments([...comments, commentToAdd]);
        setNewComment('');
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
                            <Link href="/client" className="flex items-center gap-3 group">
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
                                    href="/client"
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

                    {/* Discussion Section */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-10">
                        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-ctu-lightblue">
                                    <i className="fa-solid fa-comments text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Discussion & Q&A</h3>
                                    <p className="text-sm font-semibold text-slate-500 mt-1">Ask a question or leave a comment about this announcement.</p>
                                </div>
                            </div>
                            <span className="bg-blue-100 text-ctu-lightblue text-sm font-extrabold px-4 py-2 rounded-xl border border-blue-200">{comments.length} Comments</span>
                        </div>

                        <div className="p-8 space-y-8 bg-white">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full ${comment.avatarColor} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md`}>
                                        {comment.author.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <span className="font-bold text-base text-slate-900">{comment.author}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">{comment.role}</span>
                                            <span className="text-xs font-semibold text-slate-400 ml-auto">{comment.time}</span>
                                        </div>
                                        <div className={`p-5 rounded-2xl rounded-tl-sm text-base font-medium leading-relaxed shadow-sm ${
                                            comment.author === userName 
                                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' 
                                                : comment.role === 'Organizer'
                                                    ? 'bg-blue-50 text-blue-900 border border-blue-100'
                                                    : 'bg-slate-50 text-slate-700 border border-slate-100'
                                        }`}>
                                            {comment.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-200">
                            <form onSubmit={handleSubmitComment} className="relative flex items-end gap-4">
                                <div className="relative flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment or question..."
                                        rows={3}
                                        className="w-full p-5 bg-white border border-slate-300 rounded-2xl text-base font-medium focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all resize-none shadow-sm"
                                    />
                                </div>
                                <button type="submit" disabled={!newComment.trim()} className="h-14 px-8 rounded-2xl bg-ctu-lightblue text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-ctu-lightblue/30 shrink-0 hover:-translate-y-0.5 font-bold gap-2">
                                    Post <i className="fa-solid fa-paper-plane"></i>
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