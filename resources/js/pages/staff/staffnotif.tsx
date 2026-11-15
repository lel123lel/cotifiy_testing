import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StaffNotificationDropdown from './StaffNotificationDropdown';
import StaffSidebar from './StaffSidebar';

type StaffNotification = {
    id: string;
    title: string;
    message: string;
    office: string;
    is_read: boolean;
    link: string;
    created_at: string | null;
};

interface StaffNotificationsProps {
    notifications?: StaffNotification[];
    userName?: string;
}

export default function StaffNotifications({
    notifications = [],
    userName = 'Staff User',
}: StaffNotificationsProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const hasUnreadNotifications = notifications.some((notification) => !notification.is_read);

    const openNotification = (notification: StaffNotification) => {
        if (notification.is_read) {
            router.visit(notification.link);
            return;
        }

        router.post(`/staff/notifications/${notification.id}/read`, {}, {
            preserveScroll: true,
            showProgress: false,
            onSuccess: () => router.visit(notification.link),
        });
    };

    const markAllAsRead = () => {
        router.post('/staff/notifications/mark-all-read', {}, {
            preserveScroll: true,
            showProgress: false,
        });
    };

    const clearNotifications = () => {
        if (!window.confirm('Clear all notifications for your account? This cannot be undone.')) return;

        router.delete('/staff/notifications', {
            preserveScroll: true,
            showProgress: false,
        });
    };

    return (
        <>
            <Head title="Notifications | Cotify Staff" />
            <div className="relative flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
                <StaffSidebar
                    activePage="notifications"
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    userName={userName}
                />

                <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                aria-label="Open navigation"
                                onClick={() => setIsSidebarOpen(true)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                            >
                                <i className="fa-solid fa-bars" aria-hidden="true"></i>
                            </button>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                Notifications
                            </h1>
                        </div>
                        <StaffNotificationDropdown />
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <p className="text-sm text-slate-500">
                                    All notifications for your account
                                </p>
                                <div className="flex flex-wrap items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        disabled={!hasUnreadNotifications}
                                        className="shrink-0 rounded text-sm font-bold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400"
                                    >
                                        Mark all as read
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearNotifications}
                                        disabled={notifications.length === 0}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                                        Clear notifications
                                    </button>
                                </div>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                    <i className="fa-regular fa-bell-slash mb-4 text-3xl text-slate-300" aria-hidden="true"></i>
                                    <h2 className="text-lg font-bold text-slate-800">No notifications yet.</h2>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => openNotification(notification)}
                                            className={`relative flex w-full gap-4 border-b border-slate-100 p-4 text-left transition-colors last:border-0 sm:p-5 ${
                                                notification.is_read
                                                    ? 'bg-white hover:bg-slate-50'
                                                    : 'bg-blue-50/50 hover:bg-blue-50'
                                            }`}
                                        >
                                            {!notification.is_read && (
                                                <span
                                                    className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500"
                                                    aria-label="Unread"
                                                />
                                            )}
                                            <span className="min-w-0 flex-1 pl-2">
                                                <span className="block truncate text-base font-extrabold text-slate-900">
                                                    {notification.title}
                                                </span>
                                                <span className="mt-1 block text-sm text-slate-500">
                                                    {notification.message}
                                                </span>
                                                <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                                                    {notification.office && <span>{notification.office}</span>}
                                                    {notification.office && notification.created_at && <span aria-hidden="true">·</span>}
                                                    {notification.created_at && (
                                                        <time dateTime={notification.created_at}>
                                                            {new Date(notification.created_at).toLocaleString()}
                                                        </time>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
