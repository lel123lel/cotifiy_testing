import { Link, usePage } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';

let isStaffSidebarHovered = false;
let isStaffSidebarNavigationPending = false;
let lastStaffPointerPosition: { x: number; y: number } | null = null;

function rememberStaffPointerPosition(event: { clientX: number; clientY: number }) {
    lastStaffPointerPosition = { x: event.clientX, y: event.clientY };
}

interface StaffSidebarProps {
    activePage: 'dashboard' | 'announcements' | 'events' | 'notifications' | 'settings';
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
}

export default function StaffSidebar({
    activePage,
    isOpen,
    onClose,
    userName = 'Staff User',
}: StaffSidebarProps) {
    const [isHoveredExpanded, setIsHoveredExpanded] = useState(isStaffSidebarHovered);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    const sidebarRef = useRef<HTMLElement>(null);
    const { staffDepartment } = usePage<{ staffDepartment?: string | null }>().props;
    const isExpanded = isOpen || isHoveredExpanded;

    useLayoutEffect(() => {
        const bounds = sidebarRef.current?.getBoundingClientRect();
        const isHovered = Boolean(
            bounds &&
                lastStaffPointerPosition &&
                lastStaffPointerPosition.x >= bounds.left &&
                lastStaffPointerPosition.x <= bounds.right &&
                lastStaffPointerPosition.y >= bounds.top &&
                lastStaffPointerPosition.y <= bounds.bottom,
        );
        isStaffSidebarHovered = isHovered;
        isStaffSidebarNavigationPending = false;
        setIsHoveredExpanded(isHovered);
    }, []);

    const handleNavigationStart = (event: { clientX: number; clientY: number }) => {
        rememberStaffPointerPosition(event);
        isStaffSidebarNavigationPending = true;
        isStaffSidebarHovered = true;
        setIsHoveredExpanded(true);
    };

    const handleNavigationFinish = () => {
        isStaffSidebarNavigationPending = false;
    };

    const navLinks = [
        { href: '/staff', label: 'Dashboard', icon: 'fa-solid fa-house', id: 'dashboard' },
        { href: '/staff/announcements', label: 'Announcements', icon: 'fa-solid fa-bullhorn', id: 'announcements' },
        { href: '/staff/events', label: 'Events', icon: 'fa-regular fa-calendar', id: 'events' },
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

            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                ref={sidebarRef}
                onMouseEnter={(event) => {
                    rememberStaffPointerPosition(event);
                    isStaffSidebarHovered = true;
                    setIsHoveredExpanded(true);
                }}
                onMouseMove={rememberStaffPointerPosition}
                onMouseLeave={(event) => {
                    rememberStaffPointerPosition(event);
                    if (isStaffSidebarNavigationPending) return;
                    isStaffSidebarHovered = false;
                    setIsHoveredExpanded(false);
                }}
                className={`bg-ctu-dark absolute z-40 flex h-full shrink-0 flex-col justify-between overflow-hidden shadow-2xl transition-[width] duration-300 ease-in-out md:relative
                ${isOpen ? 'w-64' : 'w-0'}
                ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
            >
                <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">
                    
                    {/* Logo Section */}
                    <div className="flex items-center h-20 mb-4">
                        <Link href="/staff" onClick={handleNavigationStart} onFinish={handleNavigationFinish} className="flex h-full w-full items-center shrink-0">
                            <span className="flex h-full w-20 shrink-0 items-center justify-center">
                                <img src="/images/3rdLogo.png" alt="Cotify Logo" className="h-20 w-20 max-w-none object-contain sm:h-28 sm:w-28" />
                            </span>
                            <div className={`flex-none overflow-hidden whitespace-nowrap transition-[width,margin] duration-300 ease-in-out ${isExpanded ? 'ml-2 w-40' : 'ml-0 w-0'}`}>
                                <div className={`text-white transition-opacity duration-150 ${isExpanded ? 'delay-200 opacity-100' : 'opacity-0'}`}>
                                <h1 className="font-extrabold text-xl leading-tight tracking-tight">Cotify</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Staff Portal</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Main Navigation Links */}
                    <nav className="space-y-1 px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleNavigationStart}
                                onFinish={handleNavigationFinish}
                                className={`flex items-center rounded-xl py-3.5 transition-all group ${
                                    activePage === link.id
                                        ? 'bg-[#3b82f6] text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                                title={!isExpanded ? link.label : undefined}
                            >
                                <span className="flex w-14 shrink-0 justify-center">
                                    <i className={`${link.icon} w-5 text-center text-lg`}></i>
                                </span>
                                <span className={`min-w-0 whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bottom Section: Profile, Logout */}
                <div className="p-3">
                    <Link
                        href="/staff/settings"
                        onClick={handleNavigationStart}
                        onFinish={handleNavigationFinish}
                        className={`mb-2 flex w-full items-center rounded-xl py-3.5 text-left text-[15px] font-bold transition-all group ${
                            activePage === 'settings'
                                ? 'bg-[#3b82f6] text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                        title={!isExpanded ? 'Settings' : undefined}
                    >
                        <span className="flex w-14 shrink-0 justify-center">
                            <i className="fa-solid fa-gear w-5 text-center text-lg"></i>
                        </span>
                        <span className={`min-w-0 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                            Settings
                        </span>
                    </Link>

                    <div className="mb-1 flex items-center gap-3 py-3">
                        <span className="flex w-14 shrink-0 justify-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ctu-lightblue text-sm font-bold text-white ring-2 ring-transparent">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </span>
                        <div className={`whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                            <p className="text-white text-[15px] font-extrabold truncate">{userName.split(' ')[0]}</p>
                            <p className="text-slate-400 text-xs font-semibold truncate">{staffDepartment ?? 'No department assigned'}</p>
                        </div>
                    </div>
                    
                    {/* Logout Trigger */}
                    <button
                        type="button"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex w-full items-center py-3.5 text-left font-bold text-[15px] rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white group"
                        title={!isExpanded ? "Log Out" : undefined}
                    >
                        <span className="flex w-14 shrink-0 justify-center">
                            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg"></i>
                        </span>
                        <span className={`min-w-0 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </aside>

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
                                href="/staff/logout"
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
        </>
    );
}