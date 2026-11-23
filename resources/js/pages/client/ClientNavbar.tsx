import { Link, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ClientChatbot from './ClientChatbot';

type ClientNavPage = 'home' | 'announcements' | 'events' | 'saved' | 'settings';

let isClientSidebarHovered = false;
let isClientSidebarNavigationPending = false;
let lastPointerPosition: { x: number; y: number } | null = null;

function rememberPointerPosition(event: { clientX: number; clientY: number }) {
    lastPointerPosition = { x: event.clientX, y: event.clientY };
}

interface ClientNavbarProps {
    activePage?: ClientNavPage;
    announcementTitle?: string;
}

export default function ClientNavbar({ activePage, announcementTitle }: ClientNavbarProps) {
    const { auth } = usePage<{
        auth?: { user?: { name?: string; course?: string | null; profile_photo_url?: string | null } };
    }>().props;
    const userName = auth?.user?.name || 'Student';
    const userCourse = auth?.user?.course || 'Student';
    
    const [isOpen, setIsOpen] = useState(false);
    const [isHoveredExpanded, setIsHoveredExpanded] = useState(isClientSidebarHovered);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    const collapseTimeout = useRef<number | null>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const isExpanded = isOpen || isHoveredExpanded;

    useLayoutEffect(() => {
        const sidebarBounds = sidebarRef.current?.getBoundingClientRect();
        const isHovered = Boolean(
            sidebarBounds &&
                lastPointerPosition &&
                lastPointerPosition.x >= sidebarBounds.left &&
                lastPointerPosition.x <= sidebarBounds.right &&
                lastPointerPosition.y >= sidebarBounds.top &&
                lastPointerPosition.y <= sidebarBounds.bottom,
        );
        isClientSidebarHovered = isHovered;
        isClientSidebarNavigationPending = false;
        setIsHoveredExpanded(isHovered);
    }, []);

    useEffect(() => () => {
        if (collapseTimeout.current !== null) {
            window.clearTimeout(collapseTimeout.current);
        }
    }, []);

    const links: Array<{
        label: string;
        href: string;
        page: ClientNavPage;
        icon: string;
    }> = [
        { label: 'Home', href: '/client', page: 'home', icon: 'fa-solid fa-house' },
        {
            label: 'Announcements',
            href: '/client/announcements',
            page: 'announcements',
            icon: 'fa-solid fa-bullhorn',
        },
        { label: 'Events', href: '/client/events', page: 'events', icon: 'fa-regular fa-calendar' },
        { label: 'Saved', href: '/client/saved', page: 'saved', icon: 'fa-regular fa-bookmark' },
    ];

    return (
        <>
            {/* Styles for Modal Animation */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open sidebar"
                    aria-expanded={false}
                    className="fixed top-5 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
                >
                    <i className="fa-solid fa-bars" aria-hidden="true" />
                </button>
            )}

            <aside
                ref={sidebarRef}
                onMouseEnter={(event) => {
                    rememberPointerPosition(event);
                    if (collapseTimeout.current !== null) {
                        window.clearTimeout(collapseTimeout.current);
                        collapseTimeout.current = null;
                    }
                    isClientSidebarHovered = true;
                    setIsHoveredExpanded(true);
                }}
                onMouseMove={rememberPointerPosition}
                onMouseLeave={(event) => {
                    rememberPointerPosition(event);
                    if (isClientSidebarNavigationPending) {
                        return;
                    }
                    collapseTimeout.current = window.setTimeout(() => {
                        isClientSidebarHovered = false;
                        setIsHoveredExpanded(false);
                        collapseTimeout.current = null;
                    }, 120);
                }}
                className={`bg-ctu-dark absolute z-40 flex h-full shrink-0 flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out md:relative
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    w-64 ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
            >
                <div className="flex min-h-0 flex-1 flex-col">
                    
                    {/* LOGO SECTION - Made Bigger for Both Mobile & Desktop */}
                    <div className="flex h-24 items-center justify-center border-b border-slate-800/50">
                        <Link
                            href="/client"
                            aria-label="Cotify Home"
                            className="flex h-full w-full items-center"
                        >
                            {/* Fixed-width wrapper keeps the logo stationary as the sidebar expands. */}
                            <div className="flex h-full w-20 shrink-0 items-center justify-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                    className="h-20 w-20 max-w-none object-contain sm:h-28 sm:w-28"
                                />
                            </div>
                            
                            {/* Text Wrapper */}
                            <div className={`flex-none overflow-hidden whitespace-nowrap transition-[width,margin,opacity] duration-300 ease-in-out ${isExpanded ? 'ml-2 w-40 opacity-100' : 'ml-0 w-0 opacity-0'}`}>
                                <div className="text-white">
                                    <h1 className="text-xl leading-tight font-extrabold tracking-tight">Cotify</h1>
                                    <p className="mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Student Portal
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <nav className="no-scrollbar mt-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3" aria-label="Client navigation">
                        {links.map(({ label, href, page, icon }) => (
                            <Link
                                key={page}
                                href={href}
                                onClick={(event) => {
                                    rememberPointerPosition(event);
                                    isClientSidebarNavigationPending = true;
                                    isClientSidebarHovered = true;
                                    setIsHoveredExpanded(true);
                                }}
                                onFinish={() => {
                                    isClientSidebarNavigationPending = false;
                                }}
                                aria-current={activePage === page ? 'page' : undefined}
                                className={`group relative flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors ${
                                    activePage === page
                                        ? 'bg-ctu-lightblue text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                                title={!isExpanded ? label : undefined}
                            >
                                <i
                                    className={`${icon} absolute left-[18px] w-5 shrink-0 text-center text-lg opacity-100`}
                                    aria-hidden="true"
                                />
                                <span className={`ml-[42px] min-w-0 overflow-hidden whitespace-nowrap text-[15px] font-bold transition-[width,opacity] duration-300 opacity-100 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:opacity-0'}`}>
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="border-t border-slate-800/50 p-3">
                    <Link
                        href="/client/profile"
                        onClick={(event) => {
                            rememberPointerPosition(event);
                            isClientSidebarNavigationPending = true;
                            isClientSidebarHovered = true;
                            setIsHoveredExpanded(true);
                        }}
                        onFinish={() => {
                            isClientSidebarNavigationPending = false;
                        }}
                        aria-current={activePage === 'settings' ? 'page' : undefined}
                        className={`group relative mb-1 flex items-center gap-4 rounded-xl px-3 py-3.5 text-left text-[15px] font-bold transition-colors ${
                            activePage === 'settings'
                                ? 'bg-ctu-lightblue text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={!isExpanded ? 'Settings' : undefined}
                    >
                        <i
                            className="fa-solid fa-gear absolute left-[18px] w-5 shrink-0 text-center text-lg opacity-100"
                            aria-hidden="true"
                        />
                        <span className={`ml-[42px] overflow-hidden whitespace-nowrap transition-[width,opacity] duration-300 opacity-100 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:opacity-0'}`}>
                            Settings
                        </span>
                    </Link>

                    <div className="mb-1 flex items-center gap-4 rounded-xl border border-transparent px-2 py-3">
                        {auth?.user?.profile_photo_url ? (
                            <img
                                src={auth.user.profile_photo_url}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-transparent"
                            />
                        ) : (
                            <div className="bg-ctu-lightblue flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-transparent">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={`whitespace-nowrap transition-[width,opacity] duration-300 overflow-hidden opacity-100 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:opacity-0'}`}>
                            <p className="max-w-[120px] truncate text-[15px] font-extrabold text-white">{userName.split(' ')[0]}</p>
                            <p className="max-w-[120px] truncate text-xs font-semibold text-slate-400">{userCourse}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="group relative flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left text-[15px] font-bold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                        title={!isExpanded ? 'Log Out' : undefined}
                    >
                        <i
                            className="fa-solid fa-arrow-right-from-bracket absolute left-[18px] w-5 shrink-0 text-center text-lg opacity-100"
                            aria-hidden="true"
                        />
                        <span className={`ml-[42px] overflow-hidden whitespace-nowrap transition-[width,opacity] duration-300 opacity-100 ${isExpanded ? 'md:w-auto md:opacity-100' : 'md:w-0 md:opacity-0'}`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </aside>

            {isOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="animate-fade-in fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-scale-in text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>

                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-5 border border-slate-200">
                            <i className="fa-solid fa-arrow-right-from-bracket text-slate-700 text-2xl"></i>
                        </div>
                        
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Log Out?</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                            Are you sure you want to log out of Cotify? You will need to sign in again to access your portal.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsLogoutModalOpen(false)} 
                                className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/20"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            <ClientChatbot announcementTitle={announcementTitle} />
        </>
    );
}