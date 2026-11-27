import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ClientNavbar from './ClientNavbar';

interface EventAnnouncement {
    id: number;
    title: string;
    category: 'Event';
    posted_by_office: string;
    date: string;
    content: string;
    image: string | null;
    event_date: string;
    event_end_date?: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    is_pinned?: boolean;
}

interface ClientEventsProps {
    events?: EventAnnouncement[];
    isLoading?: boolean;
    user?: {
        name: string;
    };
}

// ============ URGENCY HEATMAP LOGIC ============
type UrgencyLevel = 'urgent' | 'soon' | 'info' | 'good_news' | 'pinned' | 'default';

interface UrgencyTheme {
    level: UrgencyLevel;
    label: string;
    bannerColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    bgTint: string;
    dotColor: string;
    pulse?: boolean;
}

function getUrgencyTheme(event: EventAnnouncement): UrgencyTheme {
    const now = new Date();
    let eventStart: Date | null = null;
    
    if (event.event_date) {
        const timeStr = event.start_time || '00:00';
        eventStart = new Date(`${event.event_date}T${timeStr}`);
    }

    const diffMs = eventStart ? eventStart.getTime() - now.getTime() : 0;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (eventStart && diffHours > 0 && diffHours <= 24) {
        return {
            level: 'urgent',
            label: diffHours <= 1 ? 'Deadline in < 1 hr' : `Starting in ${Math.round(diffHours)} hr${Math.round(diffHours) === 1 ? '' : 's'}`,
            bannerColor: 'bg-red-500',
            badgeBg: 'bg-red-50',
            badgeText: 'text-red-700',
            badgeBorder: 'border-red-200',
            bgTint: 'bg-red-50/30',
            dotColor: 'bg-red-500',
            pulse: true,
        };
    }

    if (event.is_pinned) {
        return {
            level: 'pinned',
            label: 'Pinned Event',
            bannerColor: 'bg-indigo-500',
            badgeBg: 'bg-indigo-50',
            badgeText: 'text-indigo-700',
            badgeBorder: 'border-indigo-200',
            bgTint: 'bg-indigo-50/20',
            dotColor: 'bg-indigo-500',
        };
    }

    if (eventStart && diffHours > 24 && diffHours <= 168) {
        const days = Math.ceil(diffHours / 24);
        return {
            level: 'soon',
            label: `Starts in ${days} day${days === 1 ? '' : 's'}`,
            bannerColor: 'bg-amber-400',
            badgeBg: 'bg-amber-50',
            badgeText: 'text-amber-700',
            badgeBorder: 'border-amber-200',
            bgTint: 'bg-amber-50/20',
            dotColor: 'bg-amber-500',
        };
    }

    const titleLower = event.title.toLowerCase();
    const contentLower = event.content.toLowerCase();
    const goodNewsKeywords = ['dean', 'award', 'achieve', 'winner', 'honor', 'congrat', 'success', 'top', 'passed', 'excellence', 'champion'];
    const isGoodNews = goodNewsKeywords.some(k => titleLower.includes(k) || contentLower.includes(k));
    
    if (isGoodNews) {
        return {
            level: 'good_news',
            label: 'Good News',
            bannerColor: 'bg-emerald-500',
            badgeBg: 'bg-emerald-50',
            badgeText: 'text-emerald-700',
            badgeBorder: 'border-emerald-200',
            bgTint: 'bg-emerald-50/20',
            dotColor: 'bg-emerald-500',
        };
    }

    return {
        level: 'info',
        label: 'Upcoming Event',
        bannerColor: 'bg-blue-500',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-200',
        bgTint: 'bg-blue-50/10',
        dotColor: 'bg-blue-500',
    };
}

export default function ClientEvents({
    events = [],
    isLoading = false,
}: ClientEventsProps) {
    // Dinosaur Animation State
    const [dinoAnimation, setDinoAnimation] = useState<{ active: boolean; row: number; col: number } | null>(null);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['events', 'unreadCount'], showProgress: false });
            }
        }, 15_000);

        return () => window.clearInterval(intervalId);
    }, []);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const calendarViewportRef = useRef<HTMLDivElement>(null);
    const calendarDragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number } | null>(null);
    const calendarDraggedRef = useRef(false);

    // --- Filtering & Sorting ---
    const filteredEvents = [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));

    // --- Calendar Logic ---
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    const getEventsForDate = (dateStr: string) => filteredEvents.filter(e =>
        e.event_date <= dateStr && (e.event_end_date || e.event_date) >= dateStr
    );

    const activeDateStr = selectedDate || (
        new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear
            ? new Date().toISOString().split('T')[0]
            : `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    );
    
    const activeDateEvents = getEventsForDate(activeDateStr);
    const activeDateObj = new Date(`${activeDateStr}T00:00:00`);
    const selectedDateInCurrentMonth = selectedDate?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`)
        ? parseInt(selectedDate.slice(-2), 10)
        : null;
    const selectedDinoPosition = selectedDateInCurrentMonth
        ? (() => {
            const index = selectedDateInCurrentMonth - 1 + firstDay;
            return { row: Math.floor(index / 7), col: index % 7 };
        })()
        : null;

    // --- Helpers ---
    const formatTime = (time: string | null) => time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : '';

    const handleDateClick = (dateStr: string, day: number) => {
        setSelectedDate(dateStr);
        
        // Calculate row and column for Dino animation
        const index = day - 1 + firstDay;
        const row = Math.floor(index / 7);
        const col = index % 7;
        
        setDinoAnimation({ active: true, row, col });
        
        // Reset after animation finishes
        setTimeout(() => {
            setDinoAnimation(null);
        }, 1200); // Duration of the run
    };

    return (
        <>
            <Head title="Events | COTIFY" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpText { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes pulse-urgent { 
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 
                    50% { opacity: 0.9; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); } 
                }
                
                /* Dino Run Animation */
                @keyframes run-across {
                    0% { transform: translateX(0); opacity: 1; }
                    80% { transform: translateX(var(--target-x)); opacity: 1; }
                    100% { transform: translateX(var(--target-x)); opacity: 1; }
                }
                @keyframes hop {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slide-up { animation: slideUpText 0.5s ease-out forwards; }
                .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pulse-urgent { animation: pulse-urgent 2.5s ease-in-out infinite; }

            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">

                <ClientNavbar activePage="events" />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10">
                    
                    {/* TOP BAR */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Events</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                            <ClientNotificationDropdown variant="light" />
                        </div>
                    </header>

                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1400px] mx-auto animate-slide-up">
                            
                            {/* PAGE HEADER & TABS */}
                            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-900">Campus Calendar</h1>
                                    <p className="mt-2 text-base text-slate-500">Discover what's happening on campus and keep track of upcoming events.</p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-96 rounded-2xl bg-slate-200"></div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    
                                    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.35fr)]">
                                            
                                            {/* Calendar Grid */}
                                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                                                
                                                <div className="-mx-6 -mt-6 mb-4 flex items-center justify-between rounded-t-3xl bg-white px-6 pt-6 pb-4 border-b border-slate-100">
                                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                                                        <i className="fa-regular fa-calendar text-ctu-lightblue bg-blue-50 p-2 rounded-lg"></i>
                                                        {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                    </h2>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={prevMonth}
                                                            aria-label="Previous month"
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <i className="fa-solid fa-chevron-left text-sm"></i>
                                                        </button>
                                                        <button
                                                            onClick={nextMonth}
                                                            aria-label="Next month"
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <i className="fa-solid fa-chevron-right text-sm"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div
                                                    ref={calendarViewportRef}
                                                    className="cursor-grab overflow-x-auto active:cursor-grabbing"
                                                    onPointerDown={(event) => {
                                                        if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target instanceof Element && event.target.closest('button'))) {
                                                            return;
                                                        }

                                                        calendarDragRef.current = {
                                                            pointerId: event.pointerId,
                                                            startX: event.clientX,
                                                            scrollLeft: event.currentTarget.scrollLeft,
                                                        };
                                                        calendarDraggedRef.current = false;
                                                    }}
                                                    onPointerMove={(event) => {
                                                        const drag = calendarDragRef.current;
                                                        if (!drag || drag.pointerId !== event.pointerId) {
                                                            return;
                                                        }

                                                        const distance = event.clientX - drag.startX;
                                                        if (Math.abs(distance) > 5) {
                                                            calendarDraggedRef.current = true;
                                                            if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                                                                event.currentTarget.setPointerCapture(event.pointerId);
                                                            }
                                                            event.currentTarget.scrollLeft = drag.scrollLeft - distance;
                                                        }
                                                    }}
                                                    onPointerUp={(event) => {
                                                        if (calendarDragRef.current?.pointerId === event.pointerId) {
                                                            calendarDragRef.current = null;
                                                            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                                                                event.currentTarget.releasePointerCapture(event.pointerId);
                                                            }
                                                        }
                                                    }}
                                                    onPointerCancel={() => {
                                                        calendarDragRef.current = null;
                                                    }}
                                                    onClickCapture={(event) => {
                                                        if (calendarDraggedRef.current) {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            calendarDraggedRef.current = false;
                                                        }
                                                    }}
                                                >
                                                <div className="min-w-[700px] xl:min-w-0 relative">

                                                    {/* DINO MARKER (Moves smoothly to the selected date box) */}
                                                    {selectedDinoPosition && (
                                                        <div 
                                                            className="absolute z-50 pointer-events-none"
                                                            style={{
                                                                top: `calc(${selectedDinoPosition.row} * (6rem + 0.25rem) + 2.5rem)`, 
                                                                left: `calc(${selectedDinoPosition.col} * (100% / 7))`,
                                                                width: 'calc(100% / 7)',
                                                                height: '6rem',
                                                                display: 'flex',
                                                                alignItems: 'flex-end',
                                                                justifyContent: 'center',
                                                                paddingBottom: '0.35rem',
                                                                transition: 'top 0.6s ease-in-out, left 0.6s ease-in-out',
                                                            }}
                                                        >
                                                            <div style={{ animation: 'hop 0.8s ease-in-out infinite' }}>
                                                                {/* Pixel Art Dinosaur */}
                                                                <img 
                                                                    src="/images/output-onlinegiftools.gif" 
                                                                    alt="Dino" 
                                                                    className="w-15 h-15 object-contain drop-shadow-md" 
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Days of Week */}
                                                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                                        <div key={i} className="py-2 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">{day}</div>
                                                    ))}
                                                </div>

                                                {/* Calendar Cells */}
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {/* Empty cells for offset */}
                                                    {Array.from({ length: firstDay }).map((_, i) => (
                                                        <div key={`empty-${i}`} className="h-24 rounded-xl bg-slate-50/50"></div>
                                                    ))}

                                                    {/* Actual days */}
                                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                        const dayEvents = getEventsForDate(dateStr);
                                                        const isSelected = selectedDate === dateStr;
                                                        const isToday = dateStr === todayStr;

                                                        return (
                                                            <div 
                                                                key={day} 
                                                                onClick={() => handleDateClick(dateStr, day)}
                                                                className={`flex h-24 cursor-pointer flex-col overflow-hidden rounded-xl border p-1.5 transition-all ${
                                                                    isToday 
                                                                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200 shadow-sm' 
                                                                        : isSelected 
                                                                            ? 'border-slate-400 bg-slate-100 ring-2 ring-slate-300 shadow-md transform scale-[1.02] z-10 relative' 
                                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                                                                        isToday 
                                                                            ? 'bg-blue-600 text-white shadow-md' 
                                                                            : isSelected 
                                                                                ? 'bg-slate-800 text-white shadow-md' 
                                                                                : 'text-slate-600 bg-slate-100'
                                                                    }`}>
                                                                        {day}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Event Previews inside Cell */}
                                                                <div className="no-scrollbar mt-1 space-y-1 overflow-y-auto">
                                                                    {dayEvents.slice(0, 2).map(e => {
                                                                        const u = getUrgencyTheme(e);
                                                                        return (
                                                                        <div key={e.id} className="flex items-center gap-1.5 truncate rounded-md bg-white px-1.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
                                                                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.dotColor}`} />
                                                                            <span className="truncate">{e.title}</span>
                                                                        </div>
                                                                    )})}
                                                                    {dayEvents.length > 2 && (
                                                                        <div className="px-1.5 pt-0.5 text-[10px] font-bold text-slate-400">+{dayEvents.length - 2} more</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                </div>
                                                </div>
                                            </div>

                                            {/* Side Panel for Selected Date */}
                                            <aside className="space-y-4">
                                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
                                                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-extrabold text-slate-900">
                                                                {activeDateObj.toLocaleDateString(undefined, { day: 'numeric' })}
                                                            </h3>
                                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                                                {activeDateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ctu-lightblue to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                                            <i className="fa-regular fa-calendar-check text-2xl"></i>
                                                        </div>
                                                    </div>
                                                    
                                                    {activeDateEvents.length === 0 ? (
                                                        <div className="py-10 text-center">
                                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                                                                <i className="fa-regular fa-calendar-xmark text-2xl text-slate-300"></i>
                                                            </div>
                                                            <p className="text-base font-bold text-slate-700">No events today</p>
                                                            <p className="text-sm font-medium text-slate-500 mt-1">Enjoy your free time!</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-5">
                                                            {activeDateEvents.map(event => {
                                                                const urgency = getUrgencyTheme(event);
                                                                return (
                                                                <div key={event.id} className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${urgency.bgTint}`}>
                                                                    
                                                                    {/* Urgency Banner */}
                                                                    <div className={`h-1.5 w-full ${urgency.bannerColor} ${urgency.pulse ? 'animate-pulse-urgent' : ''}`} />
                                                                    
                                                                    <div className="p-5">
                                                                        <div className="mb-3">
                                                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase shadow-sm bg-white ${urgency.badgeText} ${urgency.badgeBorder} ${urgency.pulse ? 'animate-pulse' : ''}`}>
                                                                                {urgency.pulse && <span className="relative flex h-1.5 w-1.5">
                                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                                                                </span>}
                                                                                {urgency.label}
                                                                            </span>
                                                                        </div>

                                                                        {/* Event Poster */}
                                                                        <div className="mb-4 h-40 w-full overflow-hidden rounded-xl border border-slate-100 bg-white relative">
                                                                            {event.image ? (
                                                                                <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                                            ) : (
                                                                                <div className="flex h-full w-full items-center justify-center text-slate-300 bg-slate-50">
                                                                                    <i className="fa-regular fa-image text-4xl"></i>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        <h4 className="mb-2 text-lg leading-tight font-extrabold text-slate-900 line-clamp-2">{event.title}</h4>
                                                                        
                                                                        <div className="mb-5 space-y-2 text-sm font-semibold text-slate-600">
                                                                            <p className="flex items-center gap-2">
                                                                                <i className="fa-regular fa-clock text-slate-400 w-4"></i>
                                                                                {formatTime(event.start_time)} {event.end_time && `– ${formatTime(event.end_time)}`}
                                                                            </p>
                                                                            <p className="flex items-center gap-2">
                                                                                <i className="fa-solid fa-location-dot text-slate-400 w-4"></i>
                                                                                <span className="truncate">{event.location}</span>
                                                                            </p>
                                                                        </div>
                                                                        
                                                                        {/* Action Button */}
                                                                        <Link 
                                                                            href={`/client/announcements/${event.id}`} 
                                                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-ctu-lightblue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                                        >
                                                                            View event details
                                                                            <i className="fa-solid fa-arrow-right text-xs"></i>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            )})}
                                                        </div>
                                                    )}
                                                </div>
                                            </aside>
                                    </div>

                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}