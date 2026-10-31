import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface EventAnnouncement {
    id: number;
    title: string;
    category: 'Event'; // Narrowed for this page
    posted_by_office: string;
    date: string; // Post date
    content: string;
    image: string | null;
    event_date: string; // YYYY-MM-DD
    start_time: string | null;
    end_time: string | null;
    location: string | null;
}

interface ClientEventsProps {
    events?: EventAnnouncement[];
    unreadCount?: number;
    isLoading?: boolean;
    user?: {
        name: string;
    };
}

export default function ClientEvents({
    events = [],
    unreadCount = 0,
    isLoading = false,
    user = { name: 'Juan' }
}: ClientEventsProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;

    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [searchTerm, setSearchTerm] = useState('');

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // --- Filtering & Sorting ---
    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.event_date.localeCompare(b.event_date));

    // --- Calendar Logic ---
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.toISOString().split('T')[0]);
    };

    const getEventsForDate = (dateStr: string) => filteredEvents.filter(e => e.event_date === dateStr);

    // Determine which date to show in the side panel (defaults to today or the 1st of the month if viewing a different month)
    const activeDateStr = selectedDate || (
        new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear
            ? new Date().toISOString().split('T')[0]
            : `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    );
    
    const activeDateEvents = getEventsForDate(activeDateStr);
    const activeDateObj = new Date(`${activeDateStr}T00:00:00`);

    // --- Helpers ---
    const formatTime = (time: string | null) => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : '';
        
    const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const formatShortDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <>
            <Head title="Events | COTIFY" />

            <style>{`
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

                .shape-move-1 { animation: move-around-1 25s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 30s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 35s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }
                .clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">
                
                {/* BACKGROUND SHAPES */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[10%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute top-[30%] right-[30%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl shape-move-3"></div>
                    <div className="absolute top-[20%] left-[10%] w-40 h-40 border-[3px] border-blue-500/10 clip-diamond animate-spin-slow"></div>
                    <div className="absolute bottom-[25%] right-[15%] w-32 h-32 border-[4px] border-indigo-500/10 rotate-12 shape-move-1"></div>
                    <div className="absolute top-[50%] right-[5%] w-56 h-56 bg-blue-400/5 clip-hexagon shape-move-3"></div>
                </div>

                {/* HEADER */}
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
                                    <Link href="/client/events" className="text-sm font-bold text-white border-b-2 border-ctu-lightblue pb-1">Events</Link>
                                    <Link href="/client/saved" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Saved</Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative hidden sm:block">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Search events..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-ctu-lightblue outline-none w-64 transition-all"
                                    />
                                </div>

                                <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-300 transition-colors">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-ctu-dark">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-700 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-ctu-lightblue text-white flex items-center justify-center font-bold text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-white hidden lg:block">{userName.split(' ')[0]} D.</span>
                                    <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    
                    {/* PAGE HEADER & TABS */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Events</h1>
                            <p className="text-sm text-slate-500 mt-1">Discover what's happening on campus.</p>
                        </div>
                        
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <button 
                                onClick={() => setView('calendar')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === 'calendar' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Calendar
                            </button>
                            <button 
                                onClick={() => setView('list')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                List
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                            <div className="lg:col-span-8 h-96 bg-slate-200 rounded-2xl"></div>
                            <div className="lg:col-span-4 h-96 bg-slate-200 rounded-2xl"></div>
                        </div>
                    ) : (
                        <div className="animate-slide-up">
                            
                            {/* --- CALENDAR VIEW --- */}
                            {view === 'calendar' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Calendar Grid */}
                                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        
                                        {/* Calendar Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-extrabold text-slate-900">
                                                {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
                                                    <i className="fa-solid fa-chevron-left text-sm"></i>
                                                </button>
                                                <button onClick={goToToday} className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                                    Today
                                                </button>
                                                <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
                                                    <i className="fa-solid fa-chevron-right text-sm"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Days of Week */}
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                <div key={i} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest py-2">{day}</div>
                                            ))}
                                        </div>

                                        {/* Calendar Cells */}
                                        <div className="grid grid-cols-7 gap-1">
                                            {/* Empty cells for offset */}
                                            {Array.from({ length: firstDay }).map((_, i) => (
                                                <div key={`empty-${i}`} className="h-24 bg-slate-50/50 rounded-lg"></div>
                                            ))}

                                            {/* Actual days */}
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const day = i + 1;
                                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const dayEvents = getEventsForDate(dateStr);
                                                const isSelected = selectedDate === dateStr;
                                                const isToday = dateStr === new Date().toISOString().split('T')[0];

                                                return (
                                                    <div 
                                                        key={day} 
                                                        onClick={() => setSelectedDate(dateStr)}
                                                        className={`h-24 p-1.5 border rounded-lg cursor-pointer transition-colors flex flex-col overflow-hidden ${
                                                            isSelected ? 'border-ctu-lightblue bg-blue-50/50' : 
                                                            isToday ? 'border-slate-300 bg-slate-50' : 
                                                            'border-transparent hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-ctu-dark text-white' : 'text-slate-700'}`}>
                                                            {day}
                                                        </span>
                                                        
                                                        {/* Event Pills */}
                                                        <div className="mt-1 space-y-1 overflow-y-auto no-scrollbar">
                                                            {dayEvents.slice(0, 2).map(e => (
                                                                <div key={e.id} className="text-[9px] font-bold text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded truncate">
                                                                    {e.title}
                                                                </div>
                                                            ))}
                                                            {dayEvents.length > 2 && (
                                                                <div className="text-[9px] font-bold text-slate-500 px-1.5">+{dayEvents.length - 2} more</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Side Panel for Selected Date */}
                                    <aside className="lg:col-span-4 space-y-4">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                            <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                                {activeDateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </h3>
                                            
                                            {activeDateEvents.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <i className="fa-regular fa-calendar-xmark text-slate-300 text-lg"></i>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-500">No events on this day.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {activeDateEvents.map(event => (
                                                        <div key={event.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                                            {/* Event Poster */}
                                                            <div className="w-full h-24 bg-slate-200 rounded-lg mb-3 overflow-hidden">
                                                                {event.image ? (
                                                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                        <i className="fa-regular fa-image text-2xl"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{event.title}</h4>
                                                            <p className="text-xs font-semibold text-slate-500 mb-2">
                                                                {formatTime(event.start_time)} {event.end_time && `– ${formatTime(event.end_time)}`} • {event.location}
                                                            </p>
                                                            
                                                            {/* Capacity / Slots */}
                                                            {/* RSVP Button */}
                                                            <Link href={`/client/announcements/${event.id}`} className="mb-2 block w-full rounded-lg border border-slate-300 bg-white py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                                                                View event details
                                                            </Link>
                                                            
                                                            {/* External Link */}
                                                            <button className="w-full py-1.5 text-[10px] font-bold text-slate-500 hover:text-ctu-lightblue transition-colors flex items-center justify-center gap-1">
                                                                Add to Google Calendar
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </aside>
                                </div>
                            )}

                            {/* --- LIST VIEW --- */}
                            {view === 'list' && (
                                <div className="max-w-4xl mx-auto space-y-4">
                                    {filteredEvents.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                            <h3 className="text-lg font-bold text-slate-800">No upcoming events found.</h3>
                                        </div>
                                    ) : (
                                        filteredEvents.map(event => (
                                            <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-5">
                                                <div className="w-full sm:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                                                    {event.image ? (
                                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <i className="fa-regular fa-image text-3xl text-slate-300"></i>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200">Event</span>
                                                            <span className="text-xs font-bold text-slate-500">{formatShortDate(event.event_date)}</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2">{event.content}</p>
                                                        <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-slate-500">
                                                            <span><i className="fa-regular fa-clock mr-1"></i> {formatTime(event.start_time)}</span>
                                                            <span><i className="fa-solid fa-location-dot mr-1"></i> {event.location}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <p className="text-[11px] font-bold text-slate-500">{event.posted_by_office}</p>
                                                        <Link href={`/client/announcements/${event.id}`} className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700">
                                                            Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 bg-ctu-dark text-white border-t border-slate-800 py-6 mt-auto">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">&copy; 2026 Cotify · College of Technology</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                            <span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}