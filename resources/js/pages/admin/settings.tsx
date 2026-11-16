import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StaffSidebar from '../staff/StaffSidebar';
import StaffNotificationDropdown from '../staff/StaffNotificationDropdown';

type StaffAccount = {
    id: number;
    name: string;
    email: string;
    office_id: number | null;
};

type Office = {
    id: number;
    name: string;
};

export default function Settings({ staffMode = false, staffName = '', offices = [], staffAccounts = [] }: { staffMode?: boolean; staffName?: string; offices?: Office[]; staffAccounts?: StaffAccount[] }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'password' | 'offices'>('password');
    const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
    const [isSavingOffice, setIsSavingOffice] = useState(false);
    const [officeErrors, setOfficeErrors] = useState<Record<string, string>>({});
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [officeName, setOfficeName] = useState('');
    const [staffAccountIds, setStaffAccountIds] = useState<number[]>([]);
    const [staffAccountSearch, setStaffAccountSearch] = useState('');
    const [isStaffAccountFieldVisible, setIsStaffAccountFieldVisible] = useState(false);
    const panelBase = staffMode ? '/staff' : '/admin';

    const navLinks = [
        { href: panelBase, label: 'Dashboard', icon: 'fa-solid fa-house', active: false },
        { href: `${panelBase}/announcements`, label: 'Announcements', icon: 'fa-solid fa-bullhorn', active: false },
        { href: `${panelBase}/events`, label: 'Events', icon: 'fa-regular fa-calendar', active: false },
        { href: `${panelBase}/users`, label: 'Students', icon: 'fa-solid fa-users', active: false },
        { href: `${panelBase}/staff`, label: 'Staff & Admins', icon: 'fa-solid fa-user-shield', active: false },
        { href: `${panelBase}/settings`, label: 'Settings', icon: 'fa-solid fa-gear', active: true },
    ];

    const openOfficeModal = (office?: Office) => {
        setEditingOffice(office ?? null);
        setOfficeName(office?.name ?? '');
        setStaffAccountIds(office
            ? staffAccounts.filter((account) => account.office_id === office.id).map((account) => account.id)
            : []);
        setStaffAccountSearch('');
        setIsStaffAccountFieldVisible(false);
        setOfficeErrors({});
        setIsOfficeModalOpen(true);
    };

    const saveOffice = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setOfficeErrors({});
        const options = {
            onStart: () => setIsSavingOffice(true),
            onSuccess: () => setIsOfficeModalOpen(false),
            onError: (errors: Record<string, string>) => setOfficeErrors(errors),
            onFinish: () => setIsSavingOffice(false),
        };
        const data = { name: officeName.trim(), staff_account_ids: staffAccountIds };

        if (editingOffice) {
            router.put(`/admin/offices/${editingOffice.id}`, data, options);
        } else {
            router.post('/admin/offices', data, options);
        }
    };

    const filteredStaffAccounts = staffAccounts.filter((account) => {
        if (account.office_id !== null && account.office_id !== editingOffice?.id) return false;
        const search = staffAccountSearch.trim().toLowerCase();
        return !search || account.name.toLowerCase().includes(search) || account.email.toLowerCase().includes(search);
    }).slice(0, 8);

    return (
        <>
            <Head title={`Settings | Cotify ${staffMode ? 'Staff' : 'Admin'}`} />

            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }

                .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }

                /* Fix: hide horizontal overflow on mobile */
                @media (max-width: 767px) {
                    .mobile-scroll-x {
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: thin;
                    }
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">

                {/* MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] left-[5%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[2px] border-blue-500/10 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[3px] border-indigo-500/10 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-500/15 rounded-full shape-move-3"></div>
                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/5 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[3px] border-indigo-500/10 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>
                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-indigo-500/5 clip-octagon shape-move-3"></div>
                </div>

                {staffMode ? (
                    <StaffSidebar
                        activePage="settings"
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        userName={staffName}
                    />
                ) : (
                    <aside
                        onMouseEnter={() => setIsSidebarExpanded(true)}
                        onMouseLeave={() => setIsSidebarExpanded(false)}
                        className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 ease-in-out shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        w-64 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
                    >
                        <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">

                            {/* Logo Section */}
                            <div className="px-4 flex items-center h-20 mb-4">
                                <Link href="/admin" className="flex items-center shrink-0">
                                    <img 
                                        src="/images/3rdLogo.png" 
                                        alt="Cotify Logo" 
                                        className="w-20 h-20 sm:w-12 sm:h-12 object-contain -ml-2 sm:-ml-1 shrink-0 transition-all duration-300" 
                                    />
                                    <div className={`text-white whitespace-nowrap transition-opacity duration-300 ml-2 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                        <h1 className="font-extrabold text-xl leading-tight tracking-tight">Cotify</h1>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Main Navigation Links */}
                            <nav className="space-y-1 px-3">
                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    Main
                                </p>
                                {navLinks.slice(0, 3).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group ${
                                            link.active
                                                ? 'bg-[#3b82f6] text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}

                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    People
                                </p>
                                {navLinks.slice(3, 5).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group ${
                                            link.active
                                                ? 'bg-[#3b82f6] text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}

                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    System
                                </p>
                                {navLinks.slice(5).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group ${
                                            link.active
                                                ? 'bg-[#3b82f6] text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* BOTTOM SECTION */}
                        <div className="p-3">
                            <div className="flex items-center gap-4 px-3 py-3 mb-1 rounded-xl border border-transparent">
                                <div className="w-10 h-10 rounded-full bg-ctu-lightblue flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-transparent">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                                <div className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    <p className="text-white text-[15px] font-extrabold truncate">Admin</p>
                                    <p className="text-slate-400 text-xs font-semibold truncate">Registrar's Office</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(true)}
                                onMouseEnter={() => setIsLogoutHovered(true)}
                                onMouseLeave={() => setIsLogoutHovered(false)}
                                className={`flex w-full items-center gap-4 px-3 py-3.5 text-left font-bold text-[15px] rounded-xl transition-all
                                    ${isLogoutHovered ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                `}
                                title={!isSidebarExpanded ? "Log Out" : undefined}
                            >
                                <i className={`fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg shrink-0 ${isLogoutHovered ? 'text-white' : 'text-slate-400'}`}></i>
                                <span className={`whitespace-nowrap transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    Log Out
                                </span>
                            </button>
                        </div>
                    </aside>
                )}

                {!staffMode && isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10 min-w-0">

                    <header className="h-16 sm:h-20 bg-transparent border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden shrink-0">
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">Settings</h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            {staffMode ? (
                                <StaffNotificationDropdown />
                            ) : (
                                <button aria-label="View notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:bg-slate-50 transition-colors shadow-sm">
                                    <i className="fa-regular fa-bell text-lg"></i>
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                </button>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1000px] mx-auto animate-fade-up">

                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Manage system preferences and your account.</p>
                            </div>

                            {/* SETTINGS TABS */}
                            <div className="flex items-center gap-6 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'password', label: 'Password' },
                                    ...(!staffMode ? [{ id: 'offices' as const, label: 'Offices' }] : []),
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id === 'password' ? 'password' : 'offices')}
                                        className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
                                            activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <span className={activeTab === tab.id ? 'border-b-2 border-slate-900 pb-3 -mb-3' : ''}>
                                            {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* TAB CONTENT: PASSWORD */}
                            {activeTab === 'password' && (
                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fade-in">
                                    <div className="border-b border-slate-200 px-4 sm:px-6 py-4">
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-lock text-blue-600"></i> Change Password
                                        </h3>
                                    </div>
                                    <Form method="put" action={`${panelBase}/settings/password`} resetOnSuccess className="space-y-5 p-4 sm:p-6 md:p-8">
                                        {({ errors, processing }) => (
                                            <>
                                                <div>
                                                    <label htmlFor="currentPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Current Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <i className="fa-solid fa-key text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                                        </div>
                                                        <input id="currentPassword" name="current_password" type="password" required autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                                    </div>
                                                    {errors.current_password && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.current_password}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="newPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">New Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <i className="fa-solid fa-lock text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                                        </div>
                                                        <input id="newPassword" name="password" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                                    </div>
                                                    {errors.password && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="confirmNewPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Confirm New Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <i className="fa-solid fa-lock text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                                        </div>
                                                        <input id="confirmNewPassword" name="password_confirmation" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                                    <button type="submit" disabled={processing} className="w-full sm:w-auto rounded-xl bg-ctu-dark px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0">
                                                        {processing ? 'Updating...' : 'Update Password'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </section>
                            )}

                            {/* TAB CONTENT: OFFICES (Mockup for super admin) */}
                            {!staffMode && activeTab === 'offices' && (
                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fade-in">
                                    <div className="border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-building text-blue-600"></i> Manage Offices
                                        </h3>
                                        <button type="button" onClick={() => openOfficeModal()} className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">
                                            + New Office
                                        </button>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-3">
                                            {offices.map((office) => {
                                                const linkedAccounts = staffAccounts.filter((account) => account.office_id === office.id);

                                                return (
                                                    <div key={office.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                        <div className="min-w-0">
                                                            <span className="font-bold text-slate-800">{office.name}</span>
                                                            {linkedAccounts.length > 0 && <p className="mt-1 text-xs text-slate-500 break-words">Linked accounts ({linkedAccounts.length}/5): {linkedAccounts.map((account) => account.name).join(', ')}</p>}
                                                        </div>
                                                        <button type="button" onClick={() => openOfficeModal(office)} className="shrink-0 text-xs font-bold text-slate-500 hover:text-slate-900 self-end sm:self-auto">Edit</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500">Linked staff accounts can only publish under their assigned office.</p>
                                    </div>
                                </section>
                            )}

                        </div>
                    </main>
                </div>

                {isOfficeModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setIsOfficeModalOpen(false)}>
                        <form
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="office-modal-title"
                            onClick={(event) => event.stopPropagation()}
                            onSubmit={saveOffice}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5 rounded-xl bg-white p-4 sm:p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h2 id="office-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900">{editingOffice ? 'Edit Office' : 'New Office'}</h2>
                                <button type="button" aria-label="Close" onClick={() => setIsOfficeModalOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0">
                                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                                </button>
                            </div>

                            <div>
                                <label htmlFor="office-name" className="mb-1.5 block text-xs font-bold uppercase text-slate-600">Office name</label>
                                <input
                                    id="office-name"
                                    autoFocus
                                    required
                                    value={officeName}
                                    onChange={(event) => setOfficeName(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                {officeErrors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{officeErrors.name}</p>}
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    aria-expanded={isStaffAccountFieldVisible}
                                    aria-controls="staff-account-picker"
                                    onClick={() => setIsStaffAccountFieldVisible((visible) => !visible)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                    <i className="fa-solid fa-link" aria-hidden="true"></i>
                                    Link Staff Account
                                </button>
                                {isStaffAccountFieldVisible && (
                                    <div id="staff-account-picker" className="space-y-2">
                                        <label htmlFor="staff-account-search" className="mb-1.5 block text-xs font-bold uppercase text-slate-600">Search staff accounts</label>
                                        <input
                                            id="staff-account-search"
                                            type="search"
                                            value={staffAccountSearch}
                                            onChange={(event) => setStaffAccountSearch(event.target.value)}
                                            placeholder="Search by name or email"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <p className="text-xs font-semibold text-blue-700">Selected {staffAccountIds.length} of 5 staff accounts</p>
                                        <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white" role="listbox" aria-label="Staff accounts">
                                            {filteredStaffAccounts.length > 0 ? filteredStaffAccounts.map((account) => (
                                                (() => {
                                                    const isSelected = staffAccountIds.includes(account.id);
                                                    const limitReached = staffAccountIds.length >= 5 && !isSelected;

                                                    return (
                                                        <button
                                                            key={account.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            disabled={limitReached}
                                                            onClick={() => setStaffAccountIds((currentIds) => isSelected
                                                                ? currentIds.filter((id) => id !== account.id)
                                                                : currentIds.length < 5 ? [...currentIds, account.id] : currentIds)}
                                                            className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <span className="flex flex-col items-start gap-0.5">
                                                                <span className="text-sm font-bold text-slate-800">{account.name}</span>
                                                                <span className="text-xs text-slate-500">{account.email}</span>
                                                            </span>
                                                            {isSelected && <i className="fa-solid fa-check text-sm text-blue-700" aria-hidden="true"></i>}
                                                        </button>
                                                    );
                                                })()
                                            )) : (
                                                <p className="px-3 py-4 text-sm text-slate-500">No staff accounts found.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {officeErrors.staff_account_ids && <p className="text-xs font-semibold text-rose-600">{officeErrors.staff_account_ids}</p>}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
                                <button type="button" onClick={() => setIsOfficeModalOpen(false)} className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 order-2 sm:order-1">Cancel</button>
                                <button type="submit" disabled={isSavingOffice} className="w-full sm:w-auto rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 order-1 sm:order-2">
                                    {isSavingOffice ? 'Saving...' : 'Save Office'}
                                </button>
                            </div>
                        </form>
                    </div>
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
                                    href={`${panelBase}/logout`}
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
            </div>
        </>
    )
}