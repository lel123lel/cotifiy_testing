import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface SavedItem {
    id: number;
    title: string;
    subtitle: string;
    category: 'Event' | 'Academic' | 'General' | 'Service';
    image: string | null;
    link: string;
    date?: string;           // Needed for urgency logic
    event_date?: string | null; // Needed for urgency logic
    start_time?: string | null;
    is_pinned?: boolean;
}

interface ClientSavedProps {
    savedItems?: SavedItem[];
    user?: { name: string };
}

// ============ URGENCY HEATMAP LOGIC (Simplified for Lists) ============
type UrgencyLevel = 'urgent' | 'soon' | 'info' | 'good_news' | 'pinned' | 'default';

interface UrgencyTheme {
    level: UrgencyLevel;
    label: string;
    spineColor: string;
    badgeBg: string;
    badgeText: string;
    bgTint: string;
    pulse?: boolean;
}

function getUrgencyTheme(item: SavedItem): UrgencyTheme {
    const now = new Date();
    let eventStart: Date | null = null;
    
    if (item.event_date) {
        const timeStr = item.start_time || '00:00';
        eventStart = new Date(`${item.event_date}T${timeStr}`);
    }

    const diffMs = eventStart ? eventStart.getTime() - now.getTime() : 0;
    const diffHours = diffMs / (1000 * 60 * 60);

    // 1. Urgent
    if (eventStart && diffHours > 0 && diffHours <= 24) {
        return {
            level: 'urgent',
            label: diffHours <= 1 ? 'Deadline < 1 hr' : `Starts in ${Math.round(diffHours)} hrs`,
            spineColor: 'bg-red-500',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            bgTint: 'bg-red-50/30',
            pulse: true,
        };
    }

    // 2. Pinned
    if (item.is_pinned) {
        return {
            level: 'pinned',
            label: 'Pinned',
            spineColor: 'bg-indigo-500',
            badgeBg: 'bg-indigo-100',
            badgeText: 'text-indigo-700',
            bgTint: 'bg-indigo-50/20',
        };
    }

    // 3. Soon
    if (eventStart && diffHours > 24 && diffHours <= 168) {
        const days = Math.ceil(diffHours / 24);
        return {
            level: 'soon',
            label: `In ${days} day${days === 1 ? '' : 's'}`,
            spineColor: 'bg-amber-500',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-700',
            bgTint: 'bg-amber-50/20',
        };
    }

    // 4. Good News
    const titleLower = item.title.toLowerCase();
    const goodNewsKeywords = ['dean', 'award', 'achieve', 'winner', 'honor', 'congrat', 'success', 'excellence', 'champion'];
    if (goodNewsKeywords.some(k => titleLower.includes(k))) {
        return {
            level: 'good_news',
            label: 'Good News',
            spineColor: 'bg-emerald-500',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            bgTint: 'bg-emerald-50/20',
        };
    }

    // 5. Info (Event/Academic)
    if (item.category === 'Event' || item.category === 'Academic') {
        return {
            level: 'info',
            label: item.category === 'Event' ? 'Event' : 'Academic',
            spineColor: 'bg-blue-500',
            badgeBg: 'bg-blue-100',
            badgeText: 'text-blue-700',
            bgTint: 'bg-blue-50/10',
        };
    }

    // 6. Default
    return {
        level: 'default',
        label: 'Notice',
        spineColor: 'bg-slate-300',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
        bgTint: 'bg-white',
    };
}

export default function ClientSaved({
    savedItems = [],
}: ClientSavedProps) {
    const [activeTab, setActiveTab] = useState<'All' | 'Events'>('All');
    const [items, setItems] = useState<SavedItem[]>(savedItems);

    const filteredItems = items.filter(item => activeTab === 'All' || item.category === 'Event');

    const handleRemove = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        setItems(items.filter(item => item.id !== id));
        router.delete(`/client/saved/${id}`, { preserveScroll: true, showProgress: false });
    };


    return (
        <>
            <Head title="Saved | COTIFY" />
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes pulse-urgent { 
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.2); } 
                    50% { opacity: 0.9; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0); } 
                }
                
                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }
                @keyframes move-around-4 { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20vw, 30vh) scale(1.2); } 100% { transform: translate(0, 0) scale(1); } }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 25s linear infinite; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pulse-urgent { animation: pulse-urgent 2.5s ease-in-out infinite; }
                
                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }
                .shape-move-4 { animation: move-around-4 30s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">
                
                {/* MOVING SHAPES BACKGROUND */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[5%] left-[5%] w-[30rem] h-[30rem] bg-blue-500/15 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-purple-500/15 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[40%] left-[30%] w-[25rem] h-[25rem] bg-indigo-500/10 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-blue-600/20 clip-hexagon shape-move-3"></div>
                    <div className="absolute bottom-[15%] left-[10%] w-48 h-48 border-[6px] border-purple-500/30 clip-diamond animate-spin-slow"></div>
                    <div className="absolute top-[45%] right-[10%] w-40 h-40 border-[5px] border-blue-500/25 rotate-12 shape-move-1"></div>
                    <div className="absolute bottom-[20%] right-[40%] w-56 h-56 border-[8px] border-indigo-500/20 clip-hexagon shape-move-2 bg-transparent">
                        <div className="w-full h-full bg-blue-500/10 clip-hexagon scale-[0.95]"></div>
                    </div>
                </div>

                <ClientNavbar activePage="saved" />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    {/* TOP BAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Saved</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                            <ClientNotificationDropdown variant="light" />
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto animate-slide-up">
                            
                            {/* PAGE HEADER & TABS */}
                            <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                <div>
                                    <p className="mt-2 text-base text-slate-500">
                                        {items.length} {items.length === 1 ? 'item' : 'items'} kept for later.
                                    </p>
                                </div>
                                
                                <div className="flex w-fit rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                                    <button 
                                        onClick={() => setActiveTab('All')}
                                        aria-pressed={activeTab === 'All'}
                                        className={`rounded-md px-5 py-1.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            activeTab === 'All' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('Events')}
                                        aria-pressed={activeTab === 'Events'}
                                        className={`rounded-md px-5 py-1.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            activeTab === 'Events' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        Events
                                    </button>
                                </div>
                            </div>

                            {/* LIST */}
                            {filteredItems.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center animate-fade-in">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                        <i className="fa-regular fa-bookmark text-2xl text-slate-300" aria-hidden="true"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Nothing else saved</h3>
                                    <p className="mt-2 text-center text-base text-slate-500">
                                        Tap <i className="fa-regular fa-bookmark mx-1 inline-block align-middle text-slate-400" aria-hidden="true"></i> on any announcement to keep it here.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in">
                                    {filteredItems.map((item) => {
                                        const urgency = getUrgencyTheme(item);
                                        
                                        return (
                                        <div 
                                            key={item.id}
                                            className={`group relative flex items-center gap-4 border-b border-slate-100 p-4 transition-colors last:border-0 sm:p-5 ${urgency.bgTint} hover:bg-slate-50/80`}
                                        >
                                            {/* Urgency Left Spine */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgency.spineColor} ${urgency.pulse ? 'animate-pulse-urgent' : ''}`} />

                                            {/* Clickable Area */}
                                            <Link 
                                                href={item.link}
                                                className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                                aria-label={`View saved item: ${item.title}`}
                                            />

                                            {/* Icon/Thumbnail */}
                                            <div className="pointer-events-none ml-2 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                ) : item.category === 'Event' ? (
                                                    <i className="fa-regular fa-calendar text-2xl text-slate-300"></i>
                                                ) : (
                                                    <i className="fa-regular fa-newspaper text-2xl text-slate-300"></i>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="pointer-events-none min-w-0 flex-1 pr-16">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    {/* Urgency Pill */}
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-widest uppercase ${urgency.badgeBg} ${urgency.badgeText} ${urgency.pulse ? 'animate-pulse' : ''}`}>
                                                        {urgency.pulse && <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                                        </span>}
                                                        {urgency.label}
                                                    </span>
                                                </div>
                                                <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                                                    {item.subtitle}
                                                </p>
                                            </div>

                                            {/* Remove Action (Rule: Text link style) */}
                                            <button 
                                                onClick={(e) => handleRemove(e, item.id)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-bold text-slate-400 transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 z-10"
                                                aria-label={`Remove ${item.title} from saved`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}