import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface ClientProfileProps {
    user: {
        name: string;
        email: string;
        student_id?: string | null;
        course?: string | null;
        year_level?: string | null;
        section?: string | null;
        profile_photo_url?: string | null;
        preferences?: {
            email_all: boolean;
            email_urgent: boolean;
            reminder: boolean;
            categories: string[];
        };
    };
}

export default function ClientProfile({ user }: ClientProfileProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');
    const photoInput = useRef<HTMLInputElement>(null);

    // Profile Form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        course: user.course || 'BSIT',
        year_level: user.year_level || '3rd Year',
        section: user.section || '',
    });

    // Password Form
    const passwordResetForm = useForm({});

    const photoForm = useForm<{ photo: File | null }>({
        photo: null,
    });

    // Notifications Form
    const prefsForm = useForm({
        preferences: user.preferences || {
            email_all: true,
            email_urgent: false,
            reminder: true,
            categories: ['Academic', 'Event', 'General', 'Service']
        }
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/client/profile', { preserveScroll: true });
    };

    const handleSendPasswordResetLink = (e: React.FormEvent) => {
        e.preventDefault();
        passwordResetForm.post('/client/profile/password/reset-link', {
            preserveScroll: true,
            onSuccess: () => passwordResetForm.reset(),
        });
    };

    const handleUpdatePreferences = (e: React.FormEvent) => {
        e.preventDefault();
        prefsForm.put('/client/profile/preferences', { preserveScroll: true });
    };

    const toggleCategory = (cat: string) => {
        const current = prefsForm.data.preferences.categories;
        const updated = current.includes(cat) 
            ? current.filter(c => c !== cat)
            : [...current, cat];
        prefsForm.setData('preferences', { ...prefsForm.data.preferences, categories: updated });
    };


    return (
        <>
            <Head title="Profile & Settings | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {profileForm.recentlySuccessful && (
                <div
                    role="status"
                    aria-live="polite"
                    className="animate-fade-in fixed left-1/2 top-5 z-[110] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-xl"
                >
                    <i className="fa-solid fa-circle-check text-emerald-600" aria-hidden="true" />
                    Changes saved successfully.
                </div>
            )}

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                <ClientNavbar activePage="settings" />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    {/* TOP BAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">

                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Settings</h2>
                        </div>
                        <ClientNotificationDropdown variant="light" />
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1000px] mx-auto animate-slide-up">
                            
                            <div className="flex flex-col md:flex-row gap-8">
                                
                                {/* SETTINGS INNER TABS */}
                                <aside className="w-full md:w-64 shrink-0 md:sticky md:top-8 md:h-fit">
                                    <nav className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`flex items-center px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-ctu-dark text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`}
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('password')}
                                            className={`flex items-center px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'password' ? 'bg-ctu-dark text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`}
                                        >
                                            Password
                                        </button>
                                    </nav>
                                </aside>

                                {/* RIGHT CONTENT AREA */}
                                <div className="flex-1">
                                    
                                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
                                        
                                        {/* PROFILE TAB */}
                                        {activeTab === 'profile' && (
                                            <form onSubmit={handleUpdateProfile} className="animate-fade-in space-y-8">
                                                
                                                {/* Header & Avatar */}
                                                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                                                    {user.profile_photo_url ? (
                                                        <img
                                                            src={user.profile_photo_url}
                                                            alt={`${user.name}'s profile`}
                                                            className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-white"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ctu-lightblue to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-4 ring-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
                                                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
                                                            <span>{user.student_id || '—'}</span>
                                                            <span>·</span>
                                                            <span className="min-w-0 break-all">{user.email}</span>
                                                        </div>
                                                        <input
                                                            ref={photoInput}
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            className="hidden"
                                                            onChange={(event) => {
                                                                const photo = event.currentTarget.files?.[0];
                                                                if (!photo) return;

                                                                photoForm.transform(() => ({ photo }));
                                                                photoForm.post('/client/profile/photo', {
                                                                    forceFormData: true,
                                                                    preserveScroll: true,
                                                                    onSuccess: () => photoForm.reset(),
                                                                });
                                                                event.currentTarget.value = '';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={photoForm.processing}
                                                            onClick={() => photoInput.current?.click()}
                                                            className="mt-3 px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {photoForm.processing ? 'Uploading...' : 'Change photo'}
                                                        </button>
                                                        {photoForm.errors.photo && (
                                                            <p className="mt-2 text-xs font-semibold text-red-600">{photoForm.errors.photo}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Form Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Course</label>
                                                        <select
                                                            value={profileForm.data.course}
                                                            onChange={e => profileForm.setData('course', e.target.value)}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all cursor-pointer"
                                                        >
                                                            <optgroup label="College of Education">
                                                                <option value="BEEd">Bachelor of Elementary Education (BEEd)</option>
                                                                <option value="BTLEd">Bachelor of Technology and Livelihood Education (BTLEd)</option>
                                                                <option value="BSEd">Bachelor of Secondary Education (BSEd)</option>
                                                                <option value="DipPE">Diploma in Professional Education</option>
                                                            </optgroup>
                                                            <optgroup label="College of Engineering">
                                                                <option value="BSIE">BS Industrial Engineering (BSIE)</option>
                                                                <option value="BSME">BS Mechanical Engineering (BSME)</option>
                                                                <option value="BSCE">BS Civil Engineering (BSCE)</option>
                                                                <option value="BSEE">BS Electrical Engineering (BSEE)</option>
                                                                <option value="BSCpE">BS Computer Engineering (BSCpE)</option>
                                                            </optgroup>
                                                            <optgroup label="College of Technology">
                                                                <option value="BSIT">BS Information Technology (BSIT)</option>
                                                                <option value="BSMx">BS Mechatronics (BSMx)</option>
                                                                <option value="BIT-Comp">BIT - Computer Technology</option>
                                                                <option value="BIT-Draft">BIT - Drafting Technology</option>
                                                                <option value="BIT-Elec">BIT - Electrical Technology</option>
                                                                <option value="BIT-Electronics">BIT - Electronics Technology</option>
                                                            </optgroup>
                                                            <optgroup label="College of Management and Entrepreneurship">
                                                                <option value="BSHM">BS Hospitality Management (BSHM)</option>
                                                                <option value="BSTM">BS Tourism Management (BSTM)</option>
                                                                <option value="BSBA">BS Business Administration (BSBA)</option>
                                                            </optgroup>
                                                            {['BSCS', 'BSIS', 'ACT'].includes(profileForm.data.course) && (
                                                                <option value={profileForm.data.course}>{profileForm.data.course}</option>
                                                            )}
                                                        </select>
                                                        {profileForm.errors.course && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.course}</p>}
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Year Level</label>
                                                        <select
                                                            value={profileForm.data.year_level}
                                                            onChange={e => profileForm.setData('year_level', e.target.value)}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all cursor-pointer"
                                                        >
                                                            <option value="1st Year">1st Year</option>
                                                            <option value="2nd Year">2nd Year</option>
                                                            <option value="3rd Year">3rd Year</option>
                                                            <option value="4th Year">4th Year</option>
                                                        </select>
                                                        {profileForm.errors.year_level && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.year_level}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Section</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.data.section}
                                                            onChange={e => profileForm.setData('section', e.target.value)}
                                                            placeholder="e.g. 3-B"
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ctu-lightblue focus:ring-4 focus:ring-ctu-lightblue/10 outline-none transition-all"
                                                        />
                                                        {profileForm.errors.section && <p className="mt-1.5 text-xs font-bold text-red-600">{profileForm.errors.section}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={profileForm.processing}
                                                        className="bg-ctu-dark text-white hover:bg-slate-800 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md"
                                                    >
                                                        {profileForm.processing ? 'Saving...' : 'Save changes'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* PASSWORD TAB */}
                                        {activeTab === 'password' && (
                                            <form onSubmit={handleSendPasswordResetLink} className="animate-fade-in space-y-6">
                                                <div className="border-b border-slate-100 pb-4 mb-6">
                                                    <h2 className="text-xl font-extrabold text-slate-900">Change Password</h2>
                                                    <p className="text-sm text-slate-500 mt-1">We’ll email you a secure link to choose a new password.</p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Account email</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{user.email}</p>
                                                </div>

                                                {passwordResetForm.recentlySuccessful && (
                                                    <p role="status" className="text-sm font-semibold text-emerald-700">
                                                        A password reset link has been sent to your email address.
                                                    </p>
                                                )}
                                                {passwordResetForm.errors.password_reset && (
                                                    <p role="alert" className="text-sm font-semibold text-red-600">
                                                        {passwordResetForm.errors.password_reset}
                                                    </p>
                                                )}

                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={passwordResetForm.processing}
                                                        className="bg-ctu-dark text-white hover:bg-slate-800 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                                                    >
                                                        {passwordResetForm.processing ? 'Sending...' : 'Send password reset link'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* NOTIFICATIONS TAB */}
                                        {activeTab === 'notifications' && (
                                            <form onSubmit={handleUpdatePreferences} className="animate-fade-in space-y-6">
                                                <div className="border-b border-slate-100 pb-4 mb-6">
                                                    <h2 className="text-xl font-extrabold text-slate-900">Notifications</h2>
                                                </div>

                                                <div className="space-y-5">
                                                    {/* Toggle 1 */}
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">Email me when there is a new announcement</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => prefsForm.setData('preferences', { ...prefsForm.data.preferences, email_all: !prefsForm.data.preferences.email_all })}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ctu-lightblue focus:ring-offset-2 ${prefsForm.data.preferences.email_all ? 'bg-ctu-dark' : 'bg-slate-200'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefsForm.data.preferences.email_all ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>

                                                    {/* Toggle 2 */}
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">Email me urgent announcements only</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => prefsForm.setData('preferences', { ...prefsForm.data.preferences, email_urgent: !prefsForm.data.preferences.email_urgent })}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ctu-lightblue focus:ring-offset-2 ${prefsForm.data.preferences.email_urgent ? 'bg-ctu-dark' : 'bg-slate-200'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefsForm.data.preferences.email_urgent ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>

                                                    {/* Toggle 3 */}
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">Remind me 1 day before events I'm going to</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => prefsForm.setData('preferences', { ...prefsForm.data.preferences, reminder: !prefsForm.data.preferences.reminder })}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ctu-lightblue focus:ring-offset-2 ${prefsForm.data.preferences.reminder ? 'bg-ctu-dark' : 'bg-slate-200'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefsForm.data.preferences.reminder ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Categories */}
                                                <div className="pt-6 mt-6 border-t border-slate-100">
                                                    <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">Categories I follow</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Academic', 'Event', 'General', 'Service'].map(cat => {
                                                            const isActive = prefsForm.data.preferences.categories.includes(cat);
                                                            return (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => toggleCategory(cat)}
                                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                                        isActive 
                                                                            ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                                                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                                                    }`}
                                                                >
                                                                    {cat} {isActive && <i className="fa-solid fa-check ml-1 text-[10px]"></i>}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4 mt-8 border-t border-slate-100">
                                                    <button
                                                        type="submit"
                                                        disabled={prefsForm.processing}
                                                        className="bg-ctu-dark text-white hover:bg-slate-800 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                                                    >
                                                        {prefsForm.processing ? 'Saving...' : 'Save preferences'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}