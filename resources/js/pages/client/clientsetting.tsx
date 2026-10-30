import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface ClientSettingsProps {
    user: {
        name: string;
        email: string;
    };
}

export default function ClientSettings({ user }: ClientSettingsProps) {
    // Form/Settings States
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [weeklyDigest, setWeeklyDigest] = useState(true);
    const [profilePublic, setProfilePublic] = useState(true);
    const [showActivity, setShowActivity] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    // Toggle Component
    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ctu-lightblue focus-visible:ring-offset-2 ${
                enabled ? 'bg-ctu-lightblue' : 'bg-slate-200'
            }`}
        >
            <span className="sr-only">Toggle setting</span>
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ${
                    enabled ? 'translate-x-2.5' : '-translate-x-2.5'
                }`}
            />
        </button>
    );

    return (
        <>
            <Head title="Settings | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                
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
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 antialiased min-h-screen relative overflow-hidden">
                
                {/* BACKGROUND SHAPES */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/15 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/15 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                    <div className="absolute top-[15%] right-[45%] w-2 h-64 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full shape-move-2"></div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    
                    {/* HEADER */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-ctu-dark/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
                                <Link href="/client" className="flex items-center group min-w-0">
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify Logo"
                                        className="w-30 h-30 object-contain -ml-3 -mr-6"
                                    />
                                    <div className="min-w-0">
                                        <h1 className="font-extrabold text-white text-sm sm:text-lg leading-tight tracking-tight truncate">COTIFY</h1>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">College of Technology</p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/client"
                                        className="text-sm font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                        <span className="hidden sm:inline">Back to Home</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500 mb-6 sm:mb-8 animate-fade-in">
                            <Link href="/client" className="hover:text-ctu-lightblue transition-colors">Home</Link>
                            <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                            <span className="text-slate-700">Settings</span>
                        </nav>

                        <div className="mb-8 animate-slide-up">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <i className="fa-solid fa-sliders text-ctu-lightblue"></i> Account Settings
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">Manage your notification preferences, privacy, and portal experience.</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            
                            {/* NOTIFICATIONS SECTION */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-6 py-5">
                                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                        <i className="fa-regular fa-bell text-ctu-lightblue"></i> Notifications
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">Choose how you want to be alerted about new announcements.</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Receive an email when a new announcement is posted.</p>
                                        </div>
                                        <Toggle enabled={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                                    </div>
                                    
                                    <div className="w-full h-px bg-slate-100"></div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Get real-time alerts in your browser.</p>
                                        </div>
                                        <Toggle enabled={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                                    </div>

                                    <div className="w-full h-px bg-slate-100"></div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Weekly Digest</p>
                                            <p className="text-xs text-slate-500 mt-0.5">A summary of the week's top announcements every Monday.</p>
                                        </div>
                                        <Toggle enabled={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} />
                                    </div>
                                </div>
                            </div>

                            {/* PRIVACY SECTION */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50 px-6 py-5">
                                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                        <i className="fa-solid fa-user-shield text-purple-600"></i> Privacy
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">Control who can see your profile and activity.</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Public Profile</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Allow other students to see your name and avatar.</p>
                                        </div>
                                        <Toggle enabled={profilePublic} onChange={() => setProfilePublic(!profilePublic)} />
                                    </div>
                                    
                                    <div className="w-full h-px bg-slate-100"></div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Show Activity Status</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Let others see when you are active in the discussion forums.</p>
                                        </div>
                                        <Toggle enabled={showActivity} onChange={() => setShowActivity(!showActivity)} />
                                    </div>
                                </div>
                            </div>

                            {/* SAVE BUTTON */}
                            <div className="flex justify-end pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-ctu-lightblue to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-ctu-lightblue/30 disabled:opacity-70 hover:-translate-y-1 flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin"></i> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check"></i> Save Preferences
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </main>

                    {/* FOOTER */}
                    <footer className="bg-ctu-dark text-white border-t border-slate-800 py-8 mt-auto relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-ctu-lightblue/10 blur-3xl"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-3 relative z-10">
                            <div className="flex items-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                     className="w-30 h-30 object-contain -ml-3 -mr-6"
                                />
                                <h1 className="font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight">COTIFY</h1>
                            </div>
                            <p className="text-[10px] sm:text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}