import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    office: string;
    time_ago: string;
    is_read: boolean;
    link: string;
    type: 'urgent' | 'academic' | 'general' | 'event';
    created_at: string; // ISO string for grouping
}

interface ClientNotificationsProps {
    notifications?: Notification[];
    unreadCount?: number;
    user?: { name: string };
}

export default function ClientNotifications({
    notifications = [],
    unreadCount = 0,
    user = { name: 'Juan' }
}: ClientNotificationsProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;
    
    // Optimistic UI state for read status
    const [items, setItems] = useState<Notification[]>(notifications);
    const [currentUnread, setCurrentUnread] = useState(unreadCount);

    // Group by Today vs Earlier
    const todayDate = new Date().toDateString();
    const todayItems = items.filter(n => new Date(n.created_at).toDateString() === todayDate);
    const earlierItems = items.filter(n => new Date(n.created_at).toDateString() !== todayDate);

    const handleMarkAllRead = () => {
        setItems(items.map(n => ({ ...n, is_read: true })));
        setCurrentUnread(0);
        router.post('/client/notifications/mark-all-read', {}, { preserveScroll: true, showProgress: false });
    };

    const handleNotificationClick = (id: number, link: string, isRead: boolean) => {
        if (!isRead) {
            setItems(items.map(n => n.id === id ? { ...n, is_read: true } : n));
            setCurrentUnread(prev => Math.max(0, prev - 1));
            router.post(`/client/notifications/${id}/read`, {}, { preserveScroll: true, showProgress: false });
        }
        router.visit(link);
    };

    const NotificationRow = ({ item }: { item: Notification }) => (
        <div 
            onClick={() => handleNotificationClick(item.id, item.link, item.is_read)}
            className={`relative p-4 sm:p-5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors flex gap-4 ${item.is_read ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'}`}
        >
            {/* Unread Dot */}
            {!item.is_read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
            )}

            <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm truncate ${item.is_read ? 'font-bold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                        {item.title}
                    </h3>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">{item.message}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-400">
                    <span>{item.office}</span>
                    <span>·</span>
                    <span>{item.time_ago}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Notifications | COTIFY" />
            <style>{`
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-15vw, 10vh) rotate(15deg); } 50% { transform: translate(-5vw, 25vh) rotate(-10deg); } 75% { transform: translate(10vw, 15vh) rotate(5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(10vw, -15vh) rotate(-20deg); } 50% { transform: translate(-20vw, -10vh) rotate(10deg); } 75% { transform: translate(-10vw, 15vh) rotate(-5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(15vw, -20vh) rotate(45deg) scale(1.2); } 66% { transform: translate(-15vw, 10vh) rotate(90deg) scale(0.8); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/10 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/10 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                </div>

                {/* Header */}
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
                                    <Link href="/announcements" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Announcements</Link>
                                    <Link href="/events" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Events</Link>
                                    <Link href="/saved" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Saved</Link>
                                </nav>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white transition-colors">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                    {currentUnread > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-ctu-dark">
                                            {currentUnread}
                                        </span>
                                    )}
                                </button>
                                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-700 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-ctu-lightblue text-white flex items-center justify-center font-bold text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-white hidden lg:block">{userName.split(' ')[0]} D.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Notifications</h1>
                        {currentUnread > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-regular fa-bell-slash text-2xl text-slate-300"></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">You're all caught up.</h3>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* TODAY */}
                            {todayItems.length > 0 && (
                                <div>
                                    <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">Today</h2>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        {todayItems.map(item => <NotificationRow key={item.id} item={item} />)}
                                    </div>
                                </div>
                            )}

                            {/* EARLIER */}
                            {earlierItems.length > 0 && (
                                <div>
                                    <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">Earlier</h2>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        {earlierItems.map(item => <NotificationRow key={item.id} item={item} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="relative z-10 bg-ctu-dark text-white border-t border-slate-800 py-6 mt-auto">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">&copy; 2026 Cotify · College of Technology</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">About</a><span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Contact</a><span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}