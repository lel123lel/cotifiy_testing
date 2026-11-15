import { Link, Form } from '@inertiajs/react';
import { useState } from 'react';

interface StaffSidebarProps {
    activePage: 'dashboard' | 'announcements' | 'events' | 'settings';
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userCourse?: string;
}

export default function StaffSidebar({
    activePage,
    isOpen,
    onClose,
    userName = 'Staff User',
    userCourse = 'Staff',
}: StaffSidebarProps) {
    const [isHoveredExpanded, setIsHoveredExpanded] = useState(false);
    const isExpanded = isOpen || isHoveredExpanded;

    const navLinks = [
        { href: '/staff', label: 'Dashboard', icon: 'fa-solid fa-house', id: 'dashboard' },
        { href: '/staff/announcements', label: 'Announcements', icon: 'fa-solid fa-bullhorn', id: 'announcements' },
        { href: '/staff/events', label: 'Events', icon: 'fa-regular fa-calendar', id: 'events' },
        { href: '/staff/settings', label: 'Settings', icon: 'fa-solid fa-gear', id: 'settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                onMouseEnter={() => setIsHoveredExpanded(true)}
                onMouseLeave={() => setIsHoveredExpanded(false)}
                className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 ease-in-out shadow-2xl
                ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
            >
                <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">
                    
                    {/* Logo Section */}
                    <div className="flex items-center h-20 mb-4">
                        <Link href="/staff" className="flex h-full w-full items-center shrink-0">
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

                    <div className="flex items-center gap-3 px-1 py-3 mb-1">
                        <span className="flex w-14 shrink-0 justify-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ctu-lightblue text-sm font-bold text-white ring-2 ring-transparent">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </span>
                        <div className={`whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                            <p className="text-white text-[15px] font-extrabold truncate">{userName.split(' ')[0]}</p>
                            <p className="text-slate-400 text-xs font-semibold truncate">{userCourse}</p>
                        </div>
                    </div>
                    
                    <Form method="post" action="/staff/logout">
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center py-3.5 text-left font-bold text-[15px] rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white group disabled:opacity-60"
                                title={!isExpanded ? "Log Out" : undefined}
                            >
                                <span className="flex w-14 shrink-0 justify-center">
                                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg"></i>
                                </span>
                                <span className={`min-w-0 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
                                    {processing ? 'Logging out...' : 'Log Out'}
                                </span>
                            </button>
                        )}
                    </Form>
                </div>
            </aside>
        </>
    );
}