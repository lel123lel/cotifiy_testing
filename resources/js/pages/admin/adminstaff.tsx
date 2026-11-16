import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
};

const formatDate = (date: string | null) => date
    ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export default function AdminStaff({ adminUsers = [], staffUsers = [] }: { adminUsers: User[]; staffUsers: User[] }) {
    const [adminSearch, setAdminSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    // Edit / delete state (mirrors the students page)
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const normalizedAdminSearch = adminSearch.trim().toLowerCase();
    const filteredAdminUsers = adminUsers.filter((admin) =>
        [admin.name, admin.email].some((value) => value.toLowerCase().includes(normalizedAdminSearch)),
    );
    const normalizedStaffSearch = staffSearch.trim().toLowerCase();
    const filteredStaffUsers = staffUsers.filter((staff) =>
        [staff.name, staff.email].some((value) => value.toLowerCase().includes(normalizedStaffSearch)),
    );

    const navLinks = [
        { href: '/admin', label: 'Dashboard', icon: 'fa-solid fa-house', active: false },
        { href: '/admin/announcements', label: 'Announcements', icon: 'fa-solid fa-bullhorn', active: false },
        { href: '/admin/events', label: 'Events', icon: 'fa-regular fa-calendar', active: false },
        { href: '/admin/users', label: 'Students', icon: 'fa-solid fa-users', active: false },
        { href: '/admin/staff', label: 'Staff & Admins', icon: 'fa-solid fa-user-shield', active: true },
        { href: '/admin/settings', label: 'Settings', icon: 'fa-solid fa-gear', active: false },
    ];

    return (
        <>
            <Head title="Manage Staff | Cotify Admin" />

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

                {/* COLLAPSIBLE SIDEBAR (now matches students page) */}
                <aside
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 ease-in-out shadow-2xl
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                    ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
                >
                    <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">

                        {/* Logo Section */}
                        <div className="px-4 flex items-center h-20 mb-4">
                            <Link href="/admin" className="flex items-center shrink-0">
                                <img src="/images/3rdLogo.png" alt="Cotify Logo" className="w-15 h-15 sm:w-28 sm:h-28 object-contain -ml-4 sm:-ml-6 -mr-6 sm:-mr-8" />
                                <div className={`text-white whitespace-nowrap transition-opacity duration-300 ml-2 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                    <h1 className="font-extrabold text-xl leading-tight tracking-tight">Cotify</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                                </div>
                            </Link>
                        </div>

                        {/* Main Navigation Links */}
                        <nav className="space-y-1 px-3">
                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}

                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}

                            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                                    <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                            <div className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                            <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Log Out
                            </span>
                        </button>
                    </div>
                </aside>

                {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">

                    <header className="h-20 bg-transparent border-b border-slate-200/50 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden">
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Manage Staff</h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative w-64 hidden md:block group">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-ctu-lightblue transition-colors"></i>
                                <input type="text" placeholder="Search..." className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-400 font-medium shadow-sm" />
                            </div>

                            <button aria-label="View notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:bg-slate-50 transition-colors shadow-sm">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-up">

                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff & Administrator Accounts</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Manage access for university staff and administrators.</p>
                            </div>

                            {/* ADMINISTRATORS TABLE */}
                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-1">
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-shield-halved text-purple-600"></i> Administrators <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">({filteredAdminUsers.length}{normalizedAdminSearch ? ` of ${adminUsers.length}` : ''})</span>
                                        </h3>
                                        <label className="relative block sm:w-64">
                                            <span className="sr-only">Search admin users</span>
                                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                                            <input type="search" value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search admins..." className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
                                        </label>
                                    </div>
                                    <button type="button" onClick={() => setIsAddAdminOpen(true)} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ctu-dark px-4 py-2 text-sm font-bold text-white transition-all shadow-md hover:bg-slate-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                                        <i className="fa-solid fa-plus"></i> Add Admin
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[820px] text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                                                <th className="px-6 py-5">Name</th>
                                                <th className="px-6 py-5">Email</th>
                                                <th className="px-6 py-5">Joined</th>
                                                <th className="px-6 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredAdminUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-16 text-center text-sm font-medium text-slate-500">
                                                        No administrators found.
                                                    </td>
                                                </tr>
                                            ) : filteredAdminUsers.map((account) => (
                                                <tr key={account.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                                {account.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{account.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-600">{account.email}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-500">{formatDate(account.created_at)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={() => setEditingUser(account)} aria-label={`Edit ${account.name}`} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit">
                                                                <i className="fa-solid fa-pen text-xs"></i>
                                                            </button>
                                                            <button type="button" onClick={() => setDeletingUser(account)} aria-label={`Delete ${account.name}`} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Delete">
                                                                <i className="fa-solid fa-trash text-xs"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* STAFF TABLE */}
                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-1">
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-user-tie text-blue-600"></i> Staff Users <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">({filteredStaffUsers.length}{normalizedStaffSearch ? ` of ${staffUsers.length}` : ''})</span>
                                        </h3>
                                        <label className="relative block sm:w-64">
                                            <span className="sr-only">Search staff users</span>
                                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                                            <input type="search" value={staffSearch} onChange={(event) => setStaffSearch(event.target.value)} placeholder="Search staff..." className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                        </label>
                                    </div>
                                    <button type="button" onClick={() => setIsAddStaffOpen(true)} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ctu-dark px-4 py-2 text-sm font-bold text-white transition-all shadow-md hover:bg-slate-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                                        <i className="fa-solid fa-plus"></i> Add Staff
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[820px] text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                                                <th className="px-6 py-5">Name</th>
                                                <th className="px-6 py-5">Email</th>
                                                <th className="px-6 py-5">Joined</th>
                                                <th className="px-6 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStaffUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-16 text-center text-sm font-medium text-slate-500">
                                                        No staff users found.
                                                    </td>
                                                </tr>
                                            ) : filteredStaffUsers.map((account) => (
                                                <tr key={account.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                                {account.name.charAt(0)}
                                                            </div>
                                                            <p className="font-bold text-slate-900">{account.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-600">{account.email}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-500">{formatDate(account.created_at)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={() => setEditingUser(account)} aria-label={`Edit ${account.name}`} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit">
                                                                <i className="fa-solid fa-pen text-xs"></i>
                                                            </button>
                                                            <button type="button" onClick={() => setDeletingUser(account)} aria-label={`Delete ${account.name}`} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Delete">
                                                                <i className="fa-solid fa-trash text-xs"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            {/* EDIT USER MODAL (mirrors students page) */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="editUserTitle">
                    <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 id="editUserTitle" className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <i className="fa-solid fa-user-pen text-blue-600"></i> Edit User
                            </h3>
                            <button type="button" onClick={() => setEditingUser(null)} aria-label="Close form" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <Form key={editingUser.id} method="put" action={`/admin/staff/${editingUser.id}`} onSuccess={() => setEditingUser(null)} className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label htmlFor="editUserName" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Name</label>
                                        <input id="editUserName" name="name" defaultValue={editingUser.name} required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.name && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="editUserEmail" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Email</label>
                                        <input id="editUserEmail" name="email" type="email" defaultValue={editingUser.email} required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.email && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.email}</p>}
                                    </div>
                                    <div className="border-t border-slate-100 pt-5">
                                        <p className="mb-4 text-xs font-extrabold uppercase tracking-wide text-slate-700">Change password</p>
                                        <p className="mb-3 text-xs font-medium text-slate-500">Leave both fields blank to keep the current password.</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="editUserPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">New Password</label>
                                                <input id="editUserPassword" name="password" type="password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                                {errors.password && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="editUserPasswordConfirmation" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Confirm New Password</label>
                                                <input id="editUserPasswordConfirmation" name="password_confirmation" type="password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                                {errors.password_confirmation && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password_confirmation}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                                        <button type="button" onClick={() => setEditingUser(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-60 transition-all">{processing ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}

            {/* DELETE USER MODAL (mirrors students page) */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="deleteUserTitle">
                    <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-scale-in text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h3 id="deleteUserTitle" className="mb-2 text-xl font-extrabold text-slate-900">Delete User</h3>
                        <p className="mb-8 text-sm font-medium text-slate-500 leading-relaxed">Are you sure you want to delete <strong className="text-slate-800">"{deletingUser.name}"</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDeletingUser(null)} disabled={isDeletingUser} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors">Cancel</button>
                            <button
                                type="button"
                                disabled={isDeletingUser}
                                onClick={() => {
                                    setIsDeletingUser(true);
                                    router.delete(`/admin/staff/${deletingUser.id}`, {
                                        onSuccess: () => setDeletingUser(null),
                                        onFinish: () => setIsDeletingUser(false),
                                    });
                                }}
                                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-colors hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeletingUser ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD ADMIN MODAL */}
            {isAddAdminOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="addAdminTitle">
                    <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 id="addAdminTitle" className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <i className="fa-solid fa-user-shield text-purple-600"></i> Add New Admin
                            </h3>
                            <button type="button" onClick={() => setIsAddAdminOpen(false)} aria-label="Close form" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <Form method="post" action="/admin/users/admins" onSuccess={() => setIsAddAdminOpen(false)} className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label htmlFor="adminName" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Name</label>
                                        <input id="adminName" name="name" required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10" />
                                        {errors.name && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminEmail" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Email</label>
                                        <input id="adminEmail" name="email" type="email" required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10" />
                                        {errors.email && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Password</label>
                                        <input id="adminPassword" name="password" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10" />
                                        {errors.password && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminPasswordConfirmation" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Confirm Password</label>
                                        <input id="adminPasswordConfirmation" name="password_confirmation" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10" />
                                        {errors.password_confirmation && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsAddAdminOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 disabled:opacity-60 transition-all">{processing ? 'Creating...' : 'Create Admin'}</button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}

            {/* ADD STAFF MODAL */}
            {isAddStaffOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="addStaffTitle">
                    <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 id="addStaffTitle" className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <i className="fa-solid fa-user-tie text-blue-600"></i> Add Staff User
                            </h3>
                            <button type="button" onClick={() => setIsAddStaffOpen(false)} aria-label="Close form" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <Form method="post" action="/admin/users/staff" onSuccess={() => setIsAddStaffOpen(false)} className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label htmlFor="staffName" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Name</label>
                                        <input id="staffName" name="name" required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.name && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="staffEmail" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Email</label>
                                        <input id="staffEmail" name="email" type="email" required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.email && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="staffPassword" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Password</label>
                                        <input id="staffPassword" name="password" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.password && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="staffPasswordConfirmation" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Confirm Password</label>
                                        <input id="staffPasswordConfirmation" name="password_confirmation" type="password" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.password_confirmation && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsAddStaffOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-60 transition-all">{processing ? 'Adding...' : 'Add Staff'}</button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}

            {/* LOGOUT CONFIRMATION MODAL (mirrors students page) */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-scale-in text-center relative overflow-hidden">
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
                                href="/admin/logout"
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
    )
}