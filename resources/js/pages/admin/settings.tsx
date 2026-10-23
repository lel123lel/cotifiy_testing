import { Form, Head, Link } from '@inertiajs/react';

export default function Settings() {
    return (
        <>
            <Head title="Settings" />
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
                            <Link href="/admin/users" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-users w-5 text-center"></i> Users
                            </Link>
                            <Link href="/admin/settings" aria-current="page" className="flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-lg text-sm font-medium transition-colors">
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
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 z-10">
                        <h1 className="text-sm font-medium text-slate-700">Settings</h1>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-6xl space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
                                <p className="text-sm text-slate-500">Update the password for your admin account.</p>
                            </div>

                            <section className="max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <h3 className="font-semibold text-sm text-slate-700">Change Password</h3>
                                </div>
                                <Form method="put" action="/admin/settings/password" resetOnSuccess className="space-y-4 p-4">
                                    {({ errors, processing }) => (
                                        <>
                                            <div>
                                                <label htmlFor="currentPassword" className="mb-1 block text-xs font-medium text-slate-600">Current Password</label>
                                                <input id="currentPassword" name="current_password" type="password" required autoComplete="current-password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                                {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="newPassword" className="mb-1 block text-xs font-medium text-slate-600">New Password</label>
                                                <input id="newPassword" name="password" type="password" required autoComplete="new-password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="confirmNewPassword" className="mb-1 block text-xs font-medium text-slate-600">Confirm New Password</label>
                                                <input id="confirmNewPassword" name="password_confirmation" type="password" required autoComplete="new-password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100" />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button type="submit" disabled={processing} className="rounded-lg bg-ctu-lightblue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60">
                                                    {processing ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}