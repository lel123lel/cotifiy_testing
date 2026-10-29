import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
};

type RegisteredUser = User & {
    studentId: string | null;
};

const formatDate = (date: string | null) => date
    ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

function AccountTable({
    accounts,
    includeStudentId = false,
    onEdit,
    onDelete,
}: {
    accounts: (User | RegisteredUser)[];
    includeStudentId?: boolean;
    onEdit?: (account: RegisteredUser) => void;
    onDelete?: (account: User) => void;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                        <th className="px-6 py-5">Name</th>
                        <th className="px-6 py-5">Email</th>
                        {includeStudentId && <th className="px-6 py-5">Student ID</th>}
                        <th className="px-6 py-5">Joined</th>
                        {(onEdit || onDelete) && <th className="px-6 py-5 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {accounts.length === 0 ? (
                        <tr>
                            <td colSpan={(includeStudentId ? 4 : 3) + (onEdit || onDelete ? 1 : 0)} className="px-6 py-16 text-center text-sm font-medium text-slate-500">
                                No accounts found.
                            </td>
                        </tr>
                    ) : accounts.map((account) => (
                        <tr key={account.id} className="text-sm text-slate-700 hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                        {account.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{account.name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600">{account.email}</td>
                            {includeStudentId && (
                                <td className="px-6 py-4 font-medium text-slate-500">{'studentId' in account ? account.studentId || '—' : '—'}</td>
                            )}
                            <td className="px-6 py-4 font-medium text-slate-500">{formatDate(account.created_at)}</td>
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {'studentId' in account && onEdit && (
                                            <button type="button" onClick={() => onEdit(account)} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit">
                                                <i className="fa-solid fa-pen text-xs"></i>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button type="button" onClick={() => onDelete(account)} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Delete">
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Users({ users, adminUsers }: { users: RegisteredUser[]; adminUsers: User[] }) {
    const [userSearch, setUserSearch] = useState('');
    const [adminSearch, setAdminSearch] = useState('');
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    
    // State for sidebar toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const normalizedUserSearch = userSearch.trim().toLowerCase();
    const normalizedAdminSearch = adminSearch.trim().toLowerCase();
    const filteredUsers = users.filter((user) =>
        [user.name, user.email, user.studentId ?? ''].some((value) => value.toLowerCase().includes(normalizedUserSearch)),
    );
    const filteredAdminUsers = adminUsers.filter((admin) =>
        [admin.name, admin.email].some((value) => value.toLowerCase().includes(normalizedAdminSearch)),
    );

    return (
        <>
            <Head title="Manage Users | Cotify" />
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                /* Moving Shapes Keyframes */
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

                .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                
                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                {/* MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-2"></div>

                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[2px] border-blue-500/10 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[3px] border-indigo-500/10 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-500/15 rounded-full shape-move-3"></div>

                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/5 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[3px] border-indigo-500/10 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>

                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-indigo-500/5 clip-octagon shape-move-3"></div>
                    
                    <div className="absolute top-[70%] right-[10%] w-28 h-28 border-[2px] border-blue-500/10 rotate-45 shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[40%] w-16 h-16 bg-indigo-500/5 rotate-12 shape-move-3"></div>

                    <div className="absolute top-[10%] right-[40%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-blue-500/5 shape-move-2"></div>
                    <div className="absolute top-[30%] right-[5%] w-3 h-48 bg-gradient-to-b from-blue-500/10 to-transparent rounded-full shape-move-1"></div>
                </div>

                {/* SIDEBAR */}
                <aside 
                    className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 shadow-2xl md:shadow-none 
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}
                >
                    <div className="w-64">
                        <div className="p-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <i className="fa-solid fa-bullhorn text-white text-lg"></i>
                            </div>
                            <div className="text-white">
                                <h1 className="font-extrabold text-lg leading-tight tracking-tight">Cotify</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-sm ring-2 ring-slate-700">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">Admin</p>
                                <p className="text-slate-400 text-xs font-medium">Administrator</p>
                            </div>
                        </div>

                        <nav className="mt-6 space-y-1.5 px-3">
                            <Link href="/admin" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all group">
                                <i className="fa-solid fa-house w-5 text-center group-hover:scale-110 transition-transform"></i> Dashboard
                            </Link>
                            <Link href="/admin/users" aria-current="page" className="flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-900/30">
                                <i className="fa-solid fa-users w-5 text-center"></i> Users
                            </Link>
                            <Link href="/admin/settings" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all group">
                                <i className="fa-solid fa-gear w-5 text-center group-hover:rotate-90 transition-transform duration-300"></i> Settings
                            </Link>
                        </nav>
                    </div>

                    <div className="p-4 border-t border-slate-800/50 w-64">
                        <Form method="post" action="/admin/logout">
                            {({ processing }) => (
                                <button type="submit" disabled={processing} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold text-slate-400 transition-all hover:text-white hover:bg-red-600 rounded-xl disabled:opacity-60 group">
                                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center group-hover:text-white transition-colors"></i> {processing ? 'Logging Out...' : 'Log Out'}
                                </button>
                            )}
                        </Form>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative z-10">
                    
                    <header className="h-20 bg-ctu-dark border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md transition-colors">
                        <div className="flex items-center gap-4">
                            {/* SIDEBAR TOGGLE BUTTON */}
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700" 
                                title="Toggle Navigation Bar"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h1 className="text-lg font-extrabold text-white tracking-tight">Manage Users</h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 relative transition-colors">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-ctu-dark animate-pulse"></span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        <div className="mx-auto max-w-6xl space-y-8">
                            <div className="animate-fade-up">
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Manage all registered students and administrators.</p>
                            </div>

                            {/* USERS TABLE */}
                            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-fade-up" style={{ animationDelay: '0.05s' }}>
                                <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                        <i className="fa-solid fa-user-graduate text-blue-600"></i> Students <span className="text-sm font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-lg">({filteredUsers.length}{normalizedUserSearch ? ` of ${users.length}` : ''})</span>
                                    </h3>
                                    <label className="relative block sm:w-72">
                                        <span className="sr-only">Search users</span>
                                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                                        <input type="search" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search students..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                    </label>
                                </div>
                                <AccountTable
                                    accounts={filteredUsers}
                                    includeStudentId
                                    onEdit={setEditingUser}
                                    onDelete={setDeletingUser}
                                />
                            </section>

                            {/* ADMIN USERS TABLE */}
                            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-1">
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <i className="fa-solid fa-shield-halved text-purple-600"></i> Administrators <span className="text-sm font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-lg">({filteredAdminUsers.length}{normalizedAdminSearch ? ` of ${adminUsers.length}` : ''})</span>
                                        </h3>
                                        <label className="relative block sm:w-64">
                                            <span className="sr-only">Search admin users</span>
                                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                                            <input type="search" value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search admins..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10" />
                                        </label>
                                    </div>
                                    <button type="button" onClick={() => setIsAddAdminOpen(true)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:-translate-y-0.5">
                                        <i className="fa-solid fa-plus"></i> Add Admin
                                    </button>
                                </div>
                                <AccountTable accounts={filteredAdminUsers} />
                            </section>
                        </div>
                    </main>
                </div>
            </div>

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

            {/* EDIT USER MODAL */}
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
                        <Form key={editingUser.id} method="put" action={`/admin/users/${editingUser.id}`} onSuccess={() => setEditingUser(null)} className="space-y-5">
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
                                    <div>
                                        <label htmlFor="editUserStudentId" className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wide">Student ID</label>
                                        <input id="editUserStudentId" name="studentId" defaultValue={editingUser.studentId ?? ''} maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                                        {errors.studentId && <p className="mt-1.5 text-xs font-bold text-red-600">{errors.studentId}</p>}
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

            {/* DELETE USER MODAL */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="deleteUserTitle">
                    <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-scale-in text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h3 id="deleteUserTitle" className="mb-2 text-xl font-extrabold text-slate-900">Delete User</h3>
                        <p className="mb-8 text-sm font-medium text-slate-500 leading-relaxed">Are you sure you want to delete <strong className="text-slate-800">“{deletingUser.name}”</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDeletingUser(null)} disabled={isDeletingUser} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors">Cancel</button>
                            <button
                                type="button"
                                disabled={isDeletingUser}
                                onClick={() => {
                                    setIsDeletingUser(true);
                                    router.delete(`/admin/users/${deletingUser.id}`, {
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
        </>
    )
}