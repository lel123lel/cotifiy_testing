import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type StaffNotification = {
    id: string;
    title: string;
    message: string;
    office: string;
    is_read: boolean;
    link: string;
    created_at: string | null;
};

type SharedProps = {
    staffUnreadCount?: number;
    staffRecentNotifications?: StaffNotification[];
};

export default function StaffNotificationDropdown() {
    const { staffUnreadCount = 0, staffRecentNotifications = [] } = usePage<SharedProps>().props;
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    const openNotification = (notification: StaffNotification) => {
        setIsOpen(false);

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

    const showAllNotifications = () => {
        setIsOpen(false);
        router.visit('/staff/notifications', {
            preserveState: false,
            preserveScroll: false,
        });
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                aria-label={`View notifications. ${staffUnreadCount} unread.`}
                aria-expanded={isOpen}
                aria-controls="staff-notification-menu"
                onClick={() => {
                    const shouldOpen = !isOpen;
                    setIsOpen(shouldOpen);
                    if (shouldOpen) {
                        router.reload({
                            only: ['staffRecentNotifications', 'staffUnreadCount'],
                            showProgress: false,
                        });
                    }
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-ctu-lightblue focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <i className="fa-regular fa-bell text-lg" aria-hidden="true"></i>
                {staffUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                        {staffUnreadCount > 99 ? '99+' : staffUnreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    id="staff-notification-menu"
                    role="region"
                    aria-label="Recent staff notifications"
                    className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <h2 className="text-sm font-extrabold text-slate-900">Recent notifications</h2>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={staffUnreadCount === 0}
                            className="rounded text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                            Mark all as read
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {staffRecentNotifications.map((notification) => (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() => openNotification(notification)}
                                className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 ${
                                    notification.is_read ? 'bg-white' : 'bg-blue-50/50'
                                }`}
                            >
                                <span className="block truncate text-sm font-bold text-slate-800">{notification.title}</span>
                                <span className="mt-1 block line-clamp-2 text-xs text-slate-500">{notification.message}</span>
                                <span className="mt-1 block text-[11px] font-medium text-slate-400">{notification.office}</span>
                            </button>
                        ))}
                        {staffRecentNotifications.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={showAllNotifications}
                        className="block w-full border-t border-slate-100 px-4 py-3 text-center text-xs font-bold text-ctu-lightblue hover:bg-slate-50"
                    >
                        Show all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
