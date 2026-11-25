import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminNotificationDropdown from './AdminNotificationDropdown';
import AdminSidebar, { useAdminSidebarOpen } from './AdminSidebar';
import StaffSidebar from '../staff/StaffSidebar';
import StaffNotificationDropdown from '../staff/StaffNotificationDropdown';

export default function Settings({ staffMode = false, staffName = '' }: { staffMode?: boolean; staffName?: string }) {
    const [isSidebarOpen, setIsSidebarOpen] = useAdminSidebarOpen(!staffMode);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const panelBase = staffMode ? '/staff' : '/admin';

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
                    <AdminSidebar
                        activePage="settings"
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        onLogout={() => setIsLogoutModalOpen(true)}
                    />
                )}

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
                                <AdminNotificationDropdown />
                            )}
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1000px] mx-auto animate-fade-up">

                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Manage system preferences and your account.</p>
                            </div>

                            {/* TAB CONTENT: PASSWORD */}
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

                        </div>
                    </main>
                </div>

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