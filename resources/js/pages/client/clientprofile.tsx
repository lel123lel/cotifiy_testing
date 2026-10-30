import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface ClientProfileProps {
    user: {
        name: string;
        email: string;
        student_id?: string | null;
        created_at: string;
    };
    stats: {
        comments: number;
        saved: number;
    };
}

export default function ClientProfile({ user, stats }: ClientProfileProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');

    // Forms
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        student_id: user.student_id || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/client/profile', { preserveScroll: true });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/client/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title="My Profile | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
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

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 antialiased min-h-screen relative overflow-hidden">
                
                {/* ========================================= */}
                {/* ADVANCED BACKGROUND SHAPES & COLORS       */}
                {/* ========================================= */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Glowing Orbs */}
                    <div className="absolute top-[5%] left-[5%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[10%] right-[5%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[40%] left-[30%] w-[25rem] h-[25rem] bg-rose-500/5 rounded-full blur-3xl shape-move-3"></div>

                    {/* Floating Geometric Shapes */}
                    <div className="absolute top-[15%] right-[20%] w-64 h-64 border-[2px] border-blue-500/15 rounded-full animate-float"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-40 h-40 border-[3px] border-indigo-500/15 clip-diamond shape-move-2"></div>
                    <div className="absolute top-[60%] right-[10%] w-32 h-32 border-[4px] border-rose-500/10 rotate-12 shape-move-1"></div>
                    
                    {/* Hexagons & Octagons */}
                    <div className="absolute top-[25%] left-[15%] w-48 h-48 bg-indigo-500/5 clip-hexagon shape-move-3"></div>
                    <div className="absolute bottom-[15%] right-[30%] w-56 h-56 border-[3px] border-blue-400/15 clip-octagon animate-spin-slow"></div>

                    {/* Abstract Lines */}
                    <div className="absolute top-[10%] right-[5%] w-2 h-64 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[5%] left-[35%] w-64 h-2 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full shape-move-3"></div>
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
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain -ml-2 sm:-ml-3 -mr-5 sm:-mr-8 group-hover:scale-105 transition-transform shrink-0"
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
                    <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500 mb-6 sm:mb-8 animate-fade-in">
                            <Link href="/client" className="hover:text-ctu-lightblue transition-colors">Home</Link>
                            <i className="fa-solid fa-chevron-right text-[8px] text-slate-400"></i>
                            <span className="text-slate-700">My Profile</span>
                        </nav>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                            
                            {/* LEFT SIDEBAR - USER SUMMARY */}
                            <aside className="lg:col-span-4 space-y-6">
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-300/40 overflow-hidden animate-slide-up relative group">
                                    
                                    {/* Cover Image (Deep Gradient) */}
                                    <div className="h-36 bg-gradient-to-br from-ctu-dark via-slate-800 to-indigo-900 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-ctu-lightblue/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                                        <div className="absolute top-4 right-4 text-white/20">
                                            <i className="fa-solid fa-gear text-4xl animate-spin-slow"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="px-6 pb-6 relative">
                                        {/* Glowing Avatar */}
                                        <div className="relative inline-block">
                                            <div className="absolute inset-0 bg-gradient-to-br from-ctu-lightblue to-indigo-600 rounded-full blur-md opacity-60 animate-pulse"></div>
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-ctu-lightblue to-blue-600 border-4 border-white flex items-center justify-center text-white font-extrabold text-3xl shadow-xl -mt-14 mb-4 relative z-10">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
                                        <p className="text-sm font-medium text-slate-500 mb-4">{user.email}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest border border-blue-200 shadow-sm flex items-center gap-1.5">
                                                <i className="fa-solid fa-graduation-cap text-[8px]"></i> Student Account
                                            </span>
                                            {user.student_id && (
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest border border-slate-200 shadow-sm">
                                                    ID: {user.student_id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Enhanced Stats */}
                                        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-default">
                                                <p className="text-2xl font-extrabold text-ctu-lightblue">{stats.comments}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Comments</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 hover:bg-rose-50 hover:border-rose-100 transition-colors cursor-default">
                                                <p className="text-2xl font-extrabold text-rose-500">{stats.saved}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Saved</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Nav (Mobile Only) */}
                                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-300/30 overflow-hidden lg:hidden">
                                    <div className="p-2 flex flex-col gap-1">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-ctu-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <i className="fa-regular fa-user w-5 text-center"></i> Profile Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('security')}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-ctu-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <i className="fa-solid fa-lock w-5 text-center"></i> Security
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('activity')}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-ctu-dark text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i> My Activity
                                        </button>
                                    </div>
                                </div>
                            </aside>

                            {/* RIGHT COLUMN - TABS & FORMS */}
                            <div className="lg:col-span-8">
                                
                                {/* Desktop Tabs */}
                                <div className="hidden lg:flex items-center gap-2 mb-6 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/80 shadow-sm w-fit animate-fade-in">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/20' : 'text-slate-600 hover:bg-white hover:text-ctu-lightblue'}`}
                                    >
                                        <i className="fa-regular fa-user"></i> Profile Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'security' ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/20' : 'text-slate-600 hover:bg-white hover:text-rose-500'}`}
                                    >
                                        <i className="fa-solid fa-shield-halved"></i> Security
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('activity')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'activity' ? 'bg-ctu-dark text-white shadow-lg shadow-ctu-dark/20' : 'text-slate-600 hover:bg-white hover:text-emerald-500'}`}
                                    >
                                        <i className="fa-solid fa-clock-rotate-left"></i> My Activity
                                    </button>
                                </div>

                                {/* TAB CONTENT */}
                                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-300/30 p-6 sm:p-8 animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
                                    
                                    {/* Decorative top border based on tab */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
                                        activeTab === 'profile' ? 'bg-gradient-to-r from-blue-400 to-indigo-600' :
                                        activeTab === 'security' ? 'bg-gradient-to-r from-rose-400 to-red-600' :
                                        'bg-gradient-to-r from-emerald-400 to-teal-600'
                                    }`}></div>

                                    {/* PROFILE TAB */}
                                    {activeTab === 'profile' && (
                                        <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in pt-2">
                                            <div className="border-b border-slate-100 pb-5 mb-6">
                                                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <i className="fa-regular fa-id-card text-lg"></i>
                                                    </div>
                                                    Personal Information
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-2">Update your account's profile information and email address.</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Full Name</label>
                                                    <div className="relative">
                                                        <i className="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                        <input 
                                                            type="text" 
                                                            value={profileForm.data.name}
                                                            onChange={e => profileForm.setData('name', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all" 
                                                        />
                                                    </div>
                                                    {profileForm.errors.name && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.name}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Student ID</label>
                                                    <div className="relative">
                                                        <i className="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                        <input 
                                                            type="text" 
                                                            value={profileForm.data.student_id}
                                                            onChange={e => profileForm.setData('student_id', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all" 
                                                        />
                                                    </div>
                                                    {profileForm.errors.student_id && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.student_id}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Email Address</label>
                                                <div className="relative">
                                                    <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                    <input 
                                                        type="email" 
                                                        value={profileForm.data.email}
                                                        onChange={e => profileForm.setData('email', e.target.value)}
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all" 
                                                    />
                                                </div>
                                                {profileForm.errors.email && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.email}</p>}
                                            </div>

                                            <div className="flex justify-end pt-5 border-t border-slate-100">
                                                <button 
                                                    type="submit" 
                                                    disabled={profileForm.processing}
                                                    className="bg-gradient-to-r from-ctu-lightblue to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-ctu-lightblue/30 disabled:opacity-50 hover:-translate-y-0.5 flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-floppy-disk"></i>
                                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* SECURITY TAB */}
                                    {activeTab === 'security' && (
                                        <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in pt-2">
                                            <div className="border-b border-slate-100 pb-5 mb-6">
                                                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                                        <i className="fa-solid fa-shield-halved text-lg"></i>
                                                    </div>
                                                    Update Password
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-2">Ensure your account is using a long, random password to stay secure.</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Current Password</label>
                                                <div className="relative">
                                                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                    <input 
                                                        type="password" 
                                                        value={passwordForm.data.current_password}
                                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" 
                                                    />
                                                </div>
                                                {passwordForm.errors.current_password && <p className="mt-1.5 text-xs font-bold text-red-600">{passwordForm.errors.current_password}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">New Password</label>
                                                    <div className="relative">
                                                        <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                        <input 
                                                            type="password" 
                                                            value={passwordForm.data.password}
                                                            onChange={e => passwordForm.setData('password', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" 
                                                        />
                                                    </div>
                                                    {passwordForm.errors.password && <p className="mt-1.5 text-xs font-bold text-red-600">{passwordForm.errors.password}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Confirm Password</label>
                                                    <div className="relative">
                                                        <i className="fa-solid fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                        <input 
                                                            type="password" 
                                                            value={passwordForm.data.password_confirmation}
                                                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" 
                                                        />
                                                    </div>
                                                    {passwordForm.errors.password_confirmation && <p className="mt-1.5 text-xs font-bold text-red-600">{passwordForm.errors.password_confirmation}</p>}
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-5 border-t border-slate-100">
                                                <button 
                                                    type="submit" 
                                                    disabled={passwordForm.processing}
                                                    className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 hover:-translate-y-0.5 flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-shield"></i>
                                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* ACTIVITY TAB */}
                                    {activeTab === 'activity' && (
                                        <div className="space-y-6 animate-fade-in pt-2">
                                            <div className="border-b border-slate-100 pb-5 mb-6">
                                                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <i className="fa-solid fa-clock-rotate-left text-lg"></i>
                                                    </div>
                                                    Account Activity
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-2">Review your recent interactions and saved items across the portal.</p>
                                            </div>

                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                                
                                                <div className="w-20 h-20 rounded-full bg-white shadow-lg shadow-emerald-500/20 flex items-center justify-center mb-5 relative z-10">
                                                    <i className="fa-regular fa-bookmark text-3xl text-emerald-500"></i>
                                                </div>
                                                <h4 className="text-xl font-extrabold text-slate-900 mb-2 relative z-10">Saved Announcements</h4>
                                                <p className="text-sm font-medium text-slate-600 mb-8 max-w-md relative z-10">
                                                    You have saved <strong className="text-emerald-600">{stats.saved}</strong> announcements. You can view them on the home page by clicking the heart icon.
                                                </p>
                                                <Link 
                                                    href="/client"
                                                    className="bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 relative z-10 hover:-translate-y-0.5"
                                                >
                                                    <i className="fa-solid fa-arrow-right"></i> Browse Announcements
                                                </Link>
                                            </div>

                                            <div className="mt-8">
                                                <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                                    <i className="fa-solid fa-message text-emerald-500"></i> Recent Comments
                                                </h4>
                                                <div className="space-y-3">
                                                    {/* Mock comment history */}
                                                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md transition-all group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Posted on Announcement #12</p>
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Approved</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 line-clamp-2">"Thank you for the update regarding the upcoming enrollment schedule. Will the requirements be posted soon?"</p>
                                                    </div>
                                                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md transition-all group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Posted on Announcement #8</p>
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Approved</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 line-clamp-2">"Is the venue for the seminar confirmed yet? I want to book my ticket."</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer className="bg-ctu-dark text-white border-t border-slate-800 py-8 mt-auto relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-ctu-lightblue/10 blur-3xl"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-3 relative z-10">
                            <div className="flex items-center">
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify Logo"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain -ml-2 sm:-ml-3 -mr-5 sm:-mr-8"
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