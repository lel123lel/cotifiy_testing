import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface SavedItem {
    id: number;
    title: string;
    subtitle: string; // e.g. Deadline or Office
    category: 'Event' | 'Academic' | 'General' | 'Service';
    link: string;
}

interface ClientSavedProps {
    savedItems?: SavedItem[];
    user?: { name: string };
}

export default function ClientSaved({
    savedItems = [],
    user = { name: 'Juan' }
}: ClientSavedProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;
    
    const [activeTab, setActiveTab] = useState<'All' | 'Events'>('All');
    const items = savedItems;

    const filteredItems = items.filter(item => activeTab === 'All' || item.category === 'Event');

    return (
        <>
            <Head title="Saved | COTIFY" />
            <style>{`
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-15vw, 10vh) rotate(15deg); } 50% { transform: translate(-5vw, 25vh) rotate(-10deg); } 75% { transform: translate(10vw, 15vh) rotate(5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(10vw, -15vh) rotate(-20deg); } 50% { transform: translate(-20vw, -10vh) rotate(10deg); } 75% { transform: translate(-10vw, 15vh) rotate(-5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(15vw, -20vh) rotate(45deg) scale(1.2); } 66% { transform: translate(-15vw, 10vh) rotate(90deg) scale(0.8); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/10 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/10 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                </div>

                {/* Header */}
                <header className="relative z-50 bg-ctu-dark/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                            <div className="flex items-center gap-8">
                                <Link href="/client" className="flex items-center shrink-0">
                                    <img src="/images/3rdLogo.png" alt="Cotify" className="w-10 h-10 sm:w-12 sm:h-12 object-contain -ml-1 -mr-3" />
                                    <span className="font-extrabold text-xl text-white hidden sm:block">Cotify</span>
                                </Link>
                                <nav className="hidden md:flex items-center gap-6">
                                    <Link href="/client" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Home</Link>
                                    <Link href="/client/announcements" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Announcements</Link>
                                    <Link href="/client/events" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Events</Link>
                                    <Link href="/client/saved" className="text-sm font-bold text-white border-b-2 border-ctu-lightblue pb-1">Saved</Link>
                                </nav>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-300 transition-colors">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                </button>
                                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-700 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-ctu-lightblue text-white flex items-center justify-center font-bold text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-white hidden lg:block">{userName.split(' ')[0]} D.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    
                    {/* Header & Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Saved</h1>
                            <span className="text-sm font-semibold text-slate-500">{items.length} items</span>
                        </div>
                        
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm w-fit">
                            <button 
                                onClick={() => setActiveTab('All')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'All' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                All
                            </button>
                            <button 
                                onClick={() => setActiveTab('Events')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'Events' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Events
                            </button>
                        </div>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
                            <h3 className="text-lg font-bold text-slate-800">Nothing else saved</h3>
                            <p className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-1">
                                Saved announcements are not available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {filteredItems.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={item.link}
                                    className="group relative flex items-center gap-4 p-4 sm:p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                                >
                                    {/* Icon/Thumbnail */}
                                    <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                                        {item.category === 'Event' ? (
                                            <i className="fa-regular fa-calendar text-2xl text-slate-300"></i>
                                        ) : (
                                            <i className="fa-regular fa-newspaper text-2xl text-slate-300"></i>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-12">
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-ctu-lightblue transition-colors truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                </Link>
                            ))}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="relative z-10 bg-ctu-dark text-white border-t border-slate-800 py-6 mt-auto">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">&copy; 2026 Cotify · College of Technology</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">About</a><span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Contact</a><span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}