import { Link } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';

type AdminPage = 'dashboard' | 'announcements' | 'events' | 'users' | 'staff' | 'settings';

let isAdminSidebarOpen = false;
let isAdminSidebarHovered = false;
let isAdminSidebarNavigationPending = false;
let lastAdminPointerPosition: { x: number; y: number } | null = null;
let adminSidebarScrollTop = 0;

function rememberAdminPointerPosition(event: { clientX: number; clientY: number }) {
    lastAdminPointerPosition = { x: event.clientX, y: event.clientY };
}

export function useAdminSidebarOpen(enabled = true) {
    const [isOpen, setIsOpen] = useState(() => enabled && isAdminSidebarOpen);

    const updateIsOpen = (value: boolean | ((current: boolean) => boolean)) => {
        setIsOpen((current) => {
            const next = typeof value === 'function' ? value(current) : value;
            if (enabled) isAdminSidebarOpen = next;
            return next;
        });
    };

    return [isOpen, updateIsOpen] as const;
}

interface AdminSidebarProps {
    activePage: AdminPage;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const navLinks: Array<{ href: string; label: string; icon: string; id: AdminPage }> = [
    { href: '/admin', label: 'Dashboard', icon: 'fa-solid fa-house', id: 'dashboard' },
    { href: '/admin/announcements', label: 'Announcements', icon: 'fa-solid fa-bullhorn', id: 'announcements' },
    { href: '/admin/events', label: 'Events', icon: 'fa-regular fa-calendar', id: 'events' },
    { href: '/admin/users', label: 'Students', icon: 'fa-solid fa-users', id: 'users' },
    { href: '/admin/staff', label: 'Staff & Admins', icon: 'fa-solid fa-user-shield', id: 'staff' },
    { href: '/admin/settings', label: 'Settings', icon: 'fa-solid fa-gear', id: 'settings' },
];

export default function AdminSidebar({ activePage, isOpen, onClose, onLogout }: AdminSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(isAdminSidebarHovered);
    const sidebarRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const peopleLinks = navLinks.slice(3, 5);
    const systemLinks = navLinks.slice(5);

    useLayoutEffect(() => {
        const bounds = sidebarRef.current?.getBoundingClientRect();
        const isHovered = Boolean(
            bounds &&
                lastAdminPointerPosition &&
                lastAdminPointerPosition.x >= bounds.left &&
                lastAdminPointerPosition.x <= bounds.right &&
                lastAdminPointerPosition.y >= bounds.top &&
                lastAdminPointerPosition.y <= bounds.bottom,
        );
        isAdminSidebarHovered = isHovered;
        isAdminSidebarNavigationPending = false;
        setIsExpanded(isHovered);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = adminSidebarScrollTop;
        }
    }, []);

    const handleNavigationStart = (event: { clientX: number; clientY: number }) => {
        rememberAdminPointerPosition(event);
        isAdminSidebarNavigationPending = true;
        isAdminSidebarHovered = true;
        setIsExpanded(true);
    };

    const handleNavigationFinish = () => {
        isAdminSidebarNavigationPending = false;
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                onMouseEnter={(event) => {
                    rememberAdminPointerPosition(event);
                    isAdminSidebarHovered = true;
                    setIsExpanded(true);
                }}
                onMouseMove={rememberAdminPointerPosition}
                onMouseLeave={(event) => {
                    rememberAdminPointerPosition(event);
                    if (isAdminSidebarNavigationPending) return;
                    isAdminSidebarHovered = false;
                    setIsExpanded(false);
                }}
                className={`bg-ctu-dark absolute z-40 flex h-full shrink-0 flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out md:relative
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    w-64 ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
            >
                <div
                    ref={scrollContainerRef}
                    onScroll={(event) => {
                        adminSidebarScrollTop = event.currentTarget.scrollTop;
                    }}
                    className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6"
                >
                    <div className="flex h-20 items-center mb-4">
                        <Link
                            href="/admin"
                            onClick={handleNavigationStart}
                            onFinish={handleNavigationFinish}
                            aria-label="Cotify Admin"
                            className="flex h-full w-full items-center shrink-0"
                        >
                            <span className="flex h-full w-20 shrink-0 items-center justify-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                    className="h-20 w-20 max-w-none object-contain sm:h-28 sm:w-28"
                                />
                            </span>
                            <span className={`flex-none overflow-hidden whitespace-nowrap transition-[width,margin] duration-300 ease-in-out ${isExpanded ? 'ml-2 w-40' : 'ml-2 w-40 md:ml-0 md:w-0'}`}>
                                <span className={`text-white transition-opacity duration-150 ${isExpanded ? 'delay-200 opacity-100' : 'md:opacity-0'}`}>
                                    <span className="block font-extrabold text-xl leading-tight tracking-tight">Cotify</span>
                                    <span className="mt-0.5 block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Portal</span>
                                </span>
                            </span>
                        </Link>
                    </div>

                    <nav className="space-y-1 px-3" aria-label="Admin navigation">
                        <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 ${isExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                            Main
                        </p>
                        {navLinks.slice(0, 3).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleNavigationStart}
                                onFinish={handleNavigationFinish}
                                aria-current={activePage === link.id ? 'page' : undefined}
                                className={`flex items-center rounded-xl py-3.5 transition-all ${
                                    activePage === link.id
                                        ? 'bg-ctu-lightblue text-white shadow-md'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                                title={!isExpanded ? link.label : undefined}
                            >
                                <span className="flex w-14 shrink-0 justify-center">
                                    <i className={`${link.icon} w-5 text-center text-lg`} aria-hidden="true"></i>
                                </span>
                                <span className={`min-w-0 whitespace-nowrap font-bold text-[15px] transition-[width,opacity] duration-300 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:overflow-hidden md:opacity-0'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        ))}

                        <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 ${isExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                            People
                        </p>
                        {peopleLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleNavigationStart}
                                onFinish={handleNavigationFinish}
                                aria-current={activePage === link.id ? 'page' : undefined}
                                className={`flex items-center rounded-xl py-3.5 transition-all ${
                                    activePage === link.id
                                        ? 'bg-ctu-lightblue text-white shadow-md'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                                title={!isExpanded ? link.label : undefined}
                            >
                                <span className="flex w-14 shrink-0 justify-center">
                                    <i className={`${link.icon} w-5 text-center text-lg`} aria-hidden="true"></i>
                                </span>
                                <span className={`min-w-0 whitespace-nowrap font-bold text-[15px] transition-[width,opacity] duration-300 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:overflow-hidden md:opacity-0'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        ))}

                        <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 ${isExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                            System
                        </p>
                        {systemLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleNavigationStart}
                                onFinish={handleNavigationFinish}
                                aria-current={activePage === link.id ? 'page' : undefined}
                                className={`flex items-center rounded-xl py-3.5 transition-all ${
                                    activePage === link.id
                                        ? 'bg-ctu-lightblue text-white shadow-md'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                                title={!isExpanded ? link.label : undefined}
                            >
                                <span className="flex w-14 shrink-0 justify-center">
                                    <i className={`${link.icon} w-5 text-center text-lg`} aria-hidden="true"></i>
                                </span>
                                <span className={`min-w-0 whitespace-nowrap font-bold text-[15px] transition-[width,opacity] duration-300 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:overflow-hidden md:opacity-0'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-3">
                    <div className="mb-1 flex items-center py-3">
                        <span className="flex w-14 shrink-0 justify-center">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ctu-lightblue text-sm font-bold text-white ring-2 ring-transparent">
                                <i className="fa-solid fa-user" aria-hidden="true"></i>
                            </span>
                        </span>
                        <span className={`min-w-0 whitespace-nowrap overflow-hidden transition-[width,opacity] duration-300 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:opacity-0'}`}>
                            <span className="block truncate text-[15px] font-extrabold text-white">Admin</span>
                            <span className="block truncate text-xs font-semibold text-slate-400">Registrar&apos;s Office</span>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center rounded-xl py-3.5 text-left text-[15px] font-bold text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white"
                        title={!isExpanded ? 'Log Out' : undefined}
                    >
                        <span className="flex w-14 shrink-0 justify-center">
                            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg" aria-hidden="true"></i>
                        </span>
                        <span className={`min-w-0 whitespace-nowrap transition-[width,opacity] duration-300 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:overflow-hidden md:opacity-0'}`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={onClose}
                ></div>
            )}
        </>
    );
}
