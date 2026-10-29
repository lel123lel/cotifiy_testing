import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Settings() {
    // State to toggle sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Settings | Cotify" />
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
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
                            <Link href="/admin/users" prefetch="mount" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all group">
                                <i className="fa-solid fa-users w-5 text-center group-hover:scale-110 transition-transform"></i> Users
                            </Link>
                            <Link href="/admin/settings" aria-current="page" className="flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-900/30">
                                <i className="fa-solid fa-gear w-5 text-center"></i> Settings
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

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative z-10">
                    
                    <header className="h-20 bg-ctu-dark border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md transition-colors">
                        <div className="flex items-center gap-4">
                            {/* TOGGLE BUTTON ADDED HERE */}
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700" 
                                title="Toggle Navigation Bar"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <h1 className="text-lg font-extrabold text-white tracking-tight">System Settings</h1>
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
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Update the password for your admin account.</p>
                            </div>

                            <section className="max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-fade-up" style={{ animationDelay: '0.05s' }}>
                                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
                                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                        <i className="fa-solid fa-lock text-blue-600"></i> Change Password
                                    </h3>
                                </div>
                                <Form method="put" action="/admin/settings/password" resetOnSuccess className="space-y-5 p-6 sm:p-8">
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
                                                <button type="submit" disabled={processing} className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0">
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