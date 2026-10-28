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
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        {includeStudentId && <th className="px-4 py-3">Student ID</th>}
                        <th className="px-4 py-3">Joined</th>
                        {(onEdit || onDelete) && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {accounts.length === 0 ? (
                        <tr>
                            <td colSpan={(includeStudentId ? 4 : 3) + (onEdit || onDelete ? 1 : 0)} className="px-4 py-8 text-center text-sm text-slate-500">
                                No accounts found.
                            </td>
                        </tr>
                    ) : accounts.map((account) => (
                        <tr key={account.id} className="border-b border-slate-100 text-sm text-slate-700 last:border-0">
                            <td className="px-4 py-3 font-medium text-slate-800">{account.name}</td>
                            <td className="px-4 py-3">{account.email}</td>
                            {includeStudentId && (
                                <td className="px-4 py-3">{'studentId' in account ? account.studentId || '—' : '—'}</td>
                            )}
                            <td className="px-4 py-3">{formatDate(account.created_at)}</td>
                            {(onEdit || onDelete) && (
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        {'studentId' in account && onEdit && (
                                            <button type="button" onClick={() => onEdit(account)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button type="button" onClick={() => onDelete(account)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                                                Delete
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
            <Head title="Users" />
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
                .animate-fade-up { animation: fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            `}</style>
            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden">
                <aside className="w-64 bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-30 h-full transition-all duration-300">
                    <div>
                        <div className="p-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-sm"></i>
                            </div>
                            <div className="text-white">
                                <h1 className="font-bold text-sm leading-tight">COTIFY</h1>
                                <p className="text-[10px] text-slate-400">College of Technology</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Admin</p>
                                <p className="text-slate-400 text-xs">Administrator</p>
                            </div>
                        </div>

                        <nav className="mt-4 space-y-1 px-3">
                            <Link href="/admin" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-house w-5 text-center"></i> Dashboard
                            </Link>
                            <Link href="/admin/users" aria-current="page" className="flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-users w-5 text-center"></i> Users
                            </Link>
                            <Link href="/admin/settings" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-gear w-5 text-center"></i> Settings
                            </Link>
                        </nav>
                    </div>

                    <div className="p-4 border-t border-slate-800">
                        <Form method="post" action="/admin/logout">
                            {({ processing }) => (
                                <button type="submit" disabled={processing} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-60">
                                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> {processing ? 'Logging Out...' : 'Log Out'}
                                </button>
                            )}
                        </Form>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-6xl space-y-8">
                            <div className="animate-fade-up">
                                <h2 className="text-xl font-bold text-slate-800">Manage Users</h2>
                                <p className="text-sm text-slate-500">Accounts currently registered in the database.</p>
                            </div>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fade-up" style={{ animationDelay: '0.05s' }}>
                                <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="font-semibold text-sm text-slate-700">Users <span className="text-slate-400">({filteredUsers.length}{normalizedUserSearch ? ` of ${users.length}` : ''})</span></h3>
                                    <label className="relative block sm:w-72">
                                        <span className="sr-only">Search users</span>
                                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
                                        <input type="search" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                    </label>
                                </div>
                                <AccountTable
                                    accounts={filteredUsers}
                                    includeStudentId
                                    onEdit={setEditingUser}
                                    onDelete={setDeletingUser}
                                />
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-1">
                                        <h3 className="font-semibold text-sm text-slate-700">Admin Users <span className="text-slate-400">({filteredAdminUsers.length}{normalizedAdminSearch ? ` of ${adminUsers.length}` : ''})</span></h3>
                                        <label className="relative block sm:w-72">
                                            <span className="sr-only">Search admin users</span>
                                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
                                            <input type="search" value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search admin users..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        </label>
                                    </div>
                                    <button type="button" onClick={() => setIsAddAdminOpen(true)} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ctu-lightblue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                                        <i className="fa-solid fa-plus"></i> Add New Admin
                                    </button>
                                </div>
                                <AccountTable accounts={filteredAdminUsers} />
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            {isAddAdminOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="addAdminTitle">
                    <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg animate-scale-in">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 id="addAdminTitle" className="text-lg font-bold text-slate-800">Add New Admin</h3>
                            <button type="button" onClick={() => setIsAddAdminOpen(false)} aria-label="Close form" className="text-slate-400 hover:text-slate-600">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <Form method="post" action="/admin/users/admins" onSuccess={() => setIsAddAdminOpen(false)} className="space-y-4">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label htmlFor="adminName" className="mb-1 block text-xs font-medium text-slate-600">Name</label>
                                        <input id="adminName" name="name" required maxLength={255} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminEmail" className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                                        <input id="adminEmail" name="email" type="email" required maxLength={255} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminPassword" className="mb-1 block text-xs font-medium text-slate-600">Password</label>
                                        <input id="adminPassword" name="password" type="password" required autoComplete="new-password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="adminPasswordConfirmation" className="mb-1 block text-xs font-medium text-slate-600">Confirm Password</label>
                                        <input id="adminPasswordConfirmation" name="password_confirmation" type="password" required autoComplete="new-password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsAddAdminOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 rounded-lg bg-ctu-lightblue py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">{processing ? 'Creating...' : 'Create Admin'}</button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="editUserTitle">
                    <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg animate-scale-in">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 id="editUserTitle" className="text-lg font-bold text-slate-800">Edit User</h3>
                            <button type="button" onClick={() => setEditingUser(null)} aria-label="Close form" className="text-slate-400 hover:text-slate-600">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <Form key={editingUser.id} method="put" action={`/admin/users/${editingUser.id}`} onSuccess={() => setEditingUser(null)} className="space-y-4">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label htmlFor="editUserName" className="mb-1 block text-xs font-medium text-slate-600">Name</label>
                                        <input id="editUserName" name="name" defaultValue={editingUser.name} required maxLength={255} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="editUserEmail" className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                                        <input id="editUserEmail" name="email" type="email" defaultValue={editingUser.email} required maxLength={255} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="editUserStudentId" className="mb-1 block text-xs font-medium text-slate-600">Student ID</label>
                                        <input id="editUserStudentId" name="studentId" defaultValue={editingUser.studentId ?? ''} maxLength={255} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                        {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setEditingUser(null)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 rounded-lg bg-ctu-lightblue py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">{processing ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}

            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="deleteUserTitle">
                    <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg animate-scale-in">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <i className="fa-solid fa-trash text-xl text-red-600"></i>
                        </div>
                        <h3 id="deleteUserTitle" className="mb-2 text-center text-lg font-bold text-slate-800">Delete User</h3>
                        <p className="mb-6 text-center text-sm text-slate-500">Are you sure you want to delete “{deletingUser.name}”? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDeletingUser(null)} disabled={isDeletingUser} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
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
                                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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