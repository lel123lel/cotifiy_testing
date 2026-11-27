import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface Notification {
    id: string;
    title: string;
    message: string;
    office: string;
    time_ago: string;
    is_read: boolean;
    link: string;
    type: 'urgent' | 'academic' | 'general' | 'event' | 'service';
    created_at: string; // ISO string for grouping
}

interface ClientNotificationsProps {
    notifications?: Notification[];
}

export default function ClientNotifications({
    notifications = [],
}: ClientNotificationsProps) {
    // Optimistic UI state for read status
    const [items, setItems] = useState<Notification[]>(notifications);

    useEffect(() => {
        setItems(notifications);
    }, [notifications]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['notifications', 'unreadCount'], showProgress: false });
            }
        }, 15_000);

        return () => window.clearInterval(intervalId);
    }, []);

    // Group by Today vs Earlier
    const todayDate = new Date().toDateString();
    const todayItems = items.filter(n => new Date(n.created_at).toDateString() === todayDate);
    const earlierItems = items.filter(n => new Date(n.created_at).toDateString() !== todayDate);

    const handleMarkAllRead = () => {
        setItems(items.map(n => ({ ...n, is_read: true })));
        router.post('/client/notifications/mark-all-read', {}, { preserveScroll: true, showProgress: false });
    };

    const handleClearNotifications = () => {
        if (!window.confirm('Clear all notifications for your account? This cannot be undone.')) return;

        router.delete('/client/notifications', {
            preserveScroll: true,
            showProgress: false,
        });
    };

    const handleNotificationClick = (id: string, link: string, isRead: boolean) => {
        if (!isRead) {
            setItems(items.map(n => n.id === id ? { ...n, is_read: true } : n));
            router.post(`/client/notifications/${id}/read`, {}, {
                preserveScroll: true,
                showProgress: false,
                onSuccess: () => router.visit(link),
            });
            return;
        }
        router.visit(link);
    };

    const NotificationRow = ({ item }: { item: Notification }) => (
        <button
            type="button"
            onClick={() => handleNotificationClick(item.id, item.link, item.is_read)}
            className={`relative flex w-full cursor-pointer gap-4 border-b border-slate-100 p-4 text-left transition-colors last:border-0 sm:p-5 ${
                item.is_read ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'
            }`}
        >
            {/* Unread Dot */}
            {!item.is_read && (
                <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500"></div>
            )}

            <div className="min-w-0 flex-1 pl-2">
                <div className="mb-1 flex items-center gap-2">
                    <h3 className={`truncate text-base ${item.is_read ? 'font-bold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                        {item.title}
                    </h3>
                </div>
                <p className="line-clamp-1 text-sm text-slate-500">{item.message}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                    <span>{item.office}</span>
                    <span>·</span>
                    <span>{item.time_ago}</span>
                </div>
            </div>
        </button>
    );

    return (
        <>
            <Head title="Notifications | COTIFY" />
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">

                <ClientNavbar />

                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Notifications</h2>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <ClientNotificationDropdown variant="light" />
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto animate-slide-up">
                            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="rounded text-sm font-bold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Mark all as read
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearNotifications}
                                        disabled={items.length === 0}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                                        Clear notifications
                                    </button>
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                        <i className="fa-regular fa-bell-slash text-2xl text-slate-300" aria-hidden="true"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">You're all caught up.</h3>
                                </div>
                            ) : (
                                <div className="animate-fade-in space-y-8">
                                    {todayItems.length > 0 && (
                                        <div>
                                            <h2 className="mb-3 px-1 text-xs font-extrabold tracking-widest text-slate-400 uppercase">Today</h2>
                                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                {todayItems.map(item => <NotificationRow key={item.id} item={item} />)}
                                            </div>
                                        </div>
                                    )}

                                    {earlierItems.length > 0 && (
                                        <div>
                                            <h2 className="mb-3 px-1 text-xs font-extrabold tracking-widest text-slate-400 uppercase">Earlier</h2>
                                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                {earlierItems.map(item => <NotificationRow key={item.id} item={item} />)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}