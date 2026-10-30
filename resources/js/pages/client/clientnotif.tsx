import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Notification {
    id: number;
    type: 'system' | 'reply' | 'announcement' | 'event';
    title: string;
    message: string;
    time: string;
    is_unread: boolean;
    action_url?: string;
}

interface ClientNotificationsProps {
    notifications: Notification[];
}

export default function ClientNotifications({ notifications: initialNotifications }: ClientNotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = notifications.filter((n) => 
        activeFilter === 'all' ? true : n.is_unread
    );

    const unreadCount = notifications.filter(n => n.is_unread).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_unread: false })));
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_unread: false } : n));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'system': return { icon: 'fa-shield-halved', color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'reply': return { icon: 'fa-reply', color: 'text-emerald-600', bg: 'bg-emerald-100' };
            case 'announcement': return { icon: 'fa-bullhorn', color: 'text-rose-600', bg: 'bg-rose-100' };
            case 'event': return { icon: 'fa-calendar-check', color: 'text-amber-600', bg: 'bg-amber-100' };
            default: return { icon: 'fa-bell', color: 'text-slate-600', bg: 'bg-slate-100' };
        }
    };

    return (
        <>
            <Head title="Notifications | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                
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

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 antialiased min-h-screen relative overflow-hidden">
                
                {/* BACKGROUND SHAPES */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[5%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[5%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[40%] left-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-2"></div>
                    
                    <div className="absolute top-[15%] right-[10%] w-48 h-48 border-[2px] border-blue-500/15 clip-octagon animate-spin-slow"></div>
                    <div className="absolute bottom-[20%] left-[15%] w-32 h-32 border-[3px] border-indigo-500/15 rotate-12 shape-move-2"></div>
                    <div className="absolute top-[60%] right-[25%] w-64 h-64 bg-blue-400/5 clip-hexagon shape-move-1"></div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    
                    {/* HEADER */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-ctu-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
                                <Link href="/client" className="flex items-center group min-w-0">
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify Logo"
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain -ml-2 sm:-ml-3 -mr-5 sm:-mr-8 group-hover:scale-105 transition-transform shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <h1 className="font-extrabold text-white text-sm sm:text-lg leading-tight tracking-tight truncate">COTIFY</h1>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">College of Technology</p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/client"
                                        className="text-sm font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                        <span className="hidden sm:inline">Back to Home</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500 mb-6 sm:mb-8 animate-fade-in">
                            <Link href="/client" className="hover:text-ctu-lightblue transition-colors">Home</Link>
                            <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                            <span className="text-slate-700">Notifications</span>
                        </nav>

                        {/* Page Title & Actions */}
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                    <i className="fa-regular fa-bell text-ctu-lightblue"></i> Notifications
                                    {unreadCount > 0 && (
                                        <span className="bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg shadow-rose-500/30">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">Stay updated with your account activity and campus alerts.</p>
                            </div>
                            
                            <button 
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="text-sm font-bold text-ctu-lightblue hover:text-blue-700 disabled:text-slate-400 transition-colors flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-slate-200 disabled:border-slate-100 disabled:bg-transparent"
                            >
                                <i className="fa-solid fa-check-double"></i> Mark all as read
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeFilter === 'all'
                                        ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/30'
                                        : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                                }`}
                            >
                                All Notifications
                            </button>
                            <button
                                onClick={() => setActiveFilter('unread')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeFilter === 'unread'
                                        ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/30'
                                        : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                                }`}
                            >
                                Unread
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            {filteredNotifications.length === 0 ? (
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 p-12 sm:p-20 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                        <i className="fa-regular fa-bell-slash text-4xl text-slate-300"></i>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-800 mb-2">You're all caught up!</h3>
                                    <p className="text-slate-500 text-sm font-medium max-w-sm">
                                        {activeFilter === 'unread' 
                                            ? "You have no unread notifications right now." 
                                            : "You don't have any notifications yet. We'll let you know when something happens."}
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => {
                                    const style = getIcon(notif.type);
                                    return (
                                        <div 
                                            key={notif.id} 
                                            className={`group relative bg-white/90 backdrop-blur-md rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex gap-4 ${
                                                notif.is_unread 
                                                    ? 'border-blue-200 shadow-md shadow-blue-500/5 hover:shadow-lg hover:border-blue-300 bg-gradient-to-r from-blue-50/50 to-white' 
                                                    : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                                            }`}
                                        >
                                            {/* Unread dot */}
                                            {notif.is_unread && (
                                                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-12 bg-blue-500 rounded-r-full"></div>
                                            )}

                                            {/* Icon */}
                                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${style.bg} ${style.color}`}>
                                                <i className={`fa-solid ${style.icon} text-lg`}></i>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                    <h4 className={`text-sm font-bold truncate ${notif.is_unread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${notif.is_unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                                    {notif.message}
                                                </p>
                                                
                                                {/* Action Button */}
                                                {notif.action_url && (
                                                    <div className="mt-3">
                                                        <Link 
                                                            href={notif.action_url}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="inline-flex items-center gap-2 text-xs font-bold text-ctu-lightblue hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            View Details <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mark Read Button (Only if unread) */}
                                            {notif.is_unread && (
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="absolute top-4 right-4 sm:opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-ctu-lightblue hover:border-ctu-lightblue flex items-center justify-center transition-all shadow-sm"
                                                    title="Mark as read"
                                                >
                                                    <i className="fa-solid fa-check text-xs"></i>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="bg-ctu-dark text-white border-t border-slate-800 py-8 mt-auto relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-ctu-lightblue/10 blur-3xl"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-3 relative z-10">
                            <div className="flex items-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain -ml-2 sm:-ml-3 -mr-5 sm:-mr-8"
                                />
                                <h1 className="font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight">COTIFY</h1>
                            </div>
                            <p className="text-[10px] sm:text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}