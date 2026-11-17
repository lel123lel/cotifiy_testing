import { Head, Link, router, useForm, Form } from '@inertiajs/react';
import { useState } from 'react';
import StaffSidebar from '../staff/StaffSidebar';
import StaffNotificationDropdown from '../staff/StaffNotificationDropdown';

type AdminEvent = {
    id: number;
    title: string;
    date: string;
    end_date: string;
    time: string;
    venue: string;
    rsvp_count: number;
    capacity: number | null;
    audience: string;
    status: 'Upcoming' | 'Past';
    start_time: string;
    end_time: string;
    is_mine: boolean;
    body: string;
    posted_by: string;
    image_url: string | null;
    attachments: EventAttachment[];
};

type EventAttachment = {
    path: string;
    name: string;
    url: string;
    size: string;
};

type EventFormData = {
    title: string;
    category: 'Event';
    posted_by: string;
    body: string;
    event_date: string;
    event_end_date: string;
    start_time: string;
    end_time: string;
    location: string;
    image: File | null;
    attachments: File[];
    remove_attachments: string[];
    _method?: 'put';
};

type TimeParts = {
    hour: string;
    minute: string;
    period: string;
};

const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTimeParts = (time: string): TimeParts => {
    if (!time) {
        return { hour: '', minute: '', period: '' };
    }

    const [hour24, minute] = time.split(':');
    const hour = Number(hour24);
    return {
        hour: String(hour % 12 || 12).padStart(2, '0'),
        minute: minute ?? '00',
        period: hour >= 12 ? 'PM' : 'AM',
    };
};

const formatTime = (time: string) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

function EventTimePicker({
    id,
    label,
    parts,
    error,
    onChange,
}: {
    id: string;
    label: string;
    parts: TimeParts;
    error?: string;
    onChange: (part: 'hour' | 'minute' | 'period', value: string) => void;
}) {
    return (
        <div>
            <label htmlFor={`${id}-hour`} className="mb-1 block text-xs font-bold text-slate-700">{label}</label>
            <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-2">
                <select
                    id={`${id}-hour`}
                    aria-label={`${label} hour`}
                    value={parts.hour}
                    onChange={(e) => onChange('hour', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                >
                    <option value="">Hour</option>
                    {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((hour) => (
                        <option key={hour} value={hour}>{Number(hour)}</option>
                    ))}
                </select>
                <select
                    aria-label={`${label} minute`}
                    value={parts.minute}
                    onChange={(e) => onChange('minute', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                >
                    <option value="">Min</option>
                    {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                    ))}
                </select>
                <select
                    aria-label={`${label} AM or PM`}
                    value={parts.period}
                    onChange={(e) => onChange('period', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                >
                    <option value="">AM/PM</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
            {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
        </div>
    );
}

export default function AdminEvents({
    events = [],
    staffMode = false,
    staffName = '',
    staffDepartment = null,
}: {
    events: AdminEvent[];
    staffMode?: boolean;
    staffName?: string;
    staffDepartment?: string | null;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showMyEventsOnly, setShowMyEventsOnly] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
    const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
    const panelBase = staffMode ? '/staff' : '/admin';
    const [selectedImageName, setSelectedImageName] = useState('');
    const [selectedAttachmentNames, setSelectedAttachmentNames] = useState<string[]>([]);
    const [startTimeParts, setStartTimeParts] = useState<TimeParts>(() => getTimeParts(''));
    const [endTimeParts, setEndTimeParts] = useState<TimeParts>(() => getTimeParts(''));
    const eventForm = useForm<EventFormData>({
        title: '',
        category: 'Event',
        posted_by: staffDepartment ?? (staffMode ? "Registrar's Office" : 'Admin'),
        body: '',
        event_date: '',
        event_end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        image: null,
        attachments: [],
        remove_attachments: [],
    });

    const openEventEditor = (event: AdminEvent | null = null) => {
        setEditingEvent(event);
        setStartTimeParts(getTimeParts(event?.start_time?.slice(0, 5) ?? ''));
        setEndTimeParts(getTimeParts(event?.end_time?.slice(0, 5) ?? ''));
        eventForm.setData({
            title: event?.title ?? '',
            category: 'Event',
            posted_by: staffDepartment ?? event?.posted_by ?? (staffMode ? "Registrar's Office" : 'Admin'),
            body: event?.body ?? '',
            event_date: event?.date ?? selectedDate ?? '',
            event_end_date: event?.end_date ?? event?.date ?? selectedDate ?? '',
            start_time: event?.start_time?.slice(0, 5) ?? '',
            end_time: event?.end_time?.slice(0, 5) ?? '',
            location: event?.venue ?? '',
            image: null,
            attachments: [],
            remove_attachments: [],
        });
        setSelectedImageName('');
        setSelectedAttachmentNames([]);
        eventForm.clearErrors();
        setIsEventEditorOpen(true);
    };

    const closeEventEditor = () => {
        setIsEventEditorOpen(false);
        setEditingEvent(null);
        eventForm.reset();
        setSelectedImageName('');
        setSelectedAttachmentNames([]);
        setStartTimeParts(getTimeParts(''));
        setEndTimeParts(getTimeParts(''));
        eventForm.clearErrors();
    };

    const saveEvent = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: closeEventEditor,
        };

        eventForm.transform((data) => editingEvent ? { ...data, _method: 'put' } : data);
        eventForm.post(editingEvent ? `${panelBase}/announcements/${editingEvent.id}` : `${panelBase}/announcements`, {
            ...options,
            forceFormData: true,
        });
    };

    const updateEventTime = (field: 'start_time' | 'end_time', part: 'hour' | 'minute' | 'period', value: string) => {
        const currentParts = field === 'start_time' ? startTimeParts : endTimeParts;
        const parts = { ...currentParts, [part]: value };
        (field === 'start_time' ? setStartTimeParts : setEndTimeParts)(parts);
        if (!parts.hour || !parts.minute || !parts.period) {
            eventForm.setData(field, '');
            return;
        }

        const hour24 = (Number(parts.hour) % 12) + (parts.period === 'PM' ? 12 : 0);
        eventForm.setData(field, `${String(hour24).padStart(2, '0')}:${parts.minute}`);
    };

    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
    const calendarDays = Array.from({ length: 42 }, (_, index) => {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + index);
        return date;
    });
    const myEvents = events.filter((event) => event.is_mine);
    const visibleEvents = showMyEventsOnly ? myEvents : events;
    const eventsByDate = visibleEvents.reduce<Record<string, AdminEvent[]>>((groupedEvents, event) => {
        const eventEndDate = event.end_date || event.date;
        for (const date of calendarDays) {
            const dateKey = toDateKey(date);
            if (event.date <= dateKey && eventEndDate >= dateKey) {
                groupedEvents[dateKey] = [...(groupedEvents[dateKey] ?? []), event];
            }
        }

        return groupedEvents;
    }, {});
    const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const confirmDelete = () => {
        if (!eventToDelete) return;
        router.delete(`${panelBase}/announcements/${eventToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setEventToDelete(null),
        });
    };

    // Navigation Links for Admin
    const navLinks = [
        { href: panelBase, label: 'Dashboard', icon: 'fa-solid fa-house', active: false },
        { href: `${panelBase}/announcements`, label: 'Announcements', icon: 'fa-solid fa-bullhorn', active: false },
        { href: `${panelBase}/events`, label: 'Events', icon: 'fa-regular fa-calendar', active: true },
        { href: `${panelBase}/users`, label: 'Students', icon: 'fa-solid fa-users', active: false },
        { href: `${panelBase}/staff`, label: 'Staff & Admins', icon: 'fa-solid fa-user-shield', active: false },
        { href: `${panelBase}/settings`, label: 'Settings', icon: 'fa-solid fa-gear', active: false },
    ];

    return (
        <>
            <Head title={`Manage Events | Cotify ${staffMode ? 'Staff' : 'Admin'}`} />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

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

                {/* SIDEBAR */}
                {staffMode ? (
                    <StaffSidebar
                        activePage="events"
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        userName={staffName}
                    />
                ) : (
                    <aside
                        onMouseEnter={() => setIsSidebarExpanded(true)}
                        onMouseLeave={() => setIsSidebarExpanded(false)}
                        className={`bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-40 h-full transition-all duration-300 ease-in-out shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        w-64 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
                    >
                        <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden pt-6">

                            {/* Logo Section */}
                            <div className="px-4 flex items-center h-20 mb-4">
                                <Link href="/admin" className="flex items-center shrink-0">
                                    <img 
                                        src="/images/3rdLogo.png" 
                                        alt="Cotify Logo" 
                                        className="w-20 h-20 sm:w-12 sm:h-12 object-contain -ml-2 sm:-ml-1 shrink-0 transition-all duration-300" 
                                    />
                                    <div className={`text-white whitespace-nowrap transition-opacity duration-300 ml-2 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                        <h1 className="font-extrabold text-xl leading-tight tracking-tight">Cotify</h1>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Main Navigation Links */}
                            <nav className="space-y-1 px-3">
                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    Main
                                </p>
                                {navLinks.slice(0, 3).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group ${
                                            link.active
                                                ? 'bg-[#3b82f6] text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}

                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    People
                                </p>
                                {navLinks.slice(3, 5).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}

                                <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    System
                                </p>
                                {navLinks.slice(5).map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        title={!isSidebarExpanded ? link.label : undefined}
                                    >
                                        <i className={`${link.icon} w-5 text-center text-lg shrink-0`}></i>
                                        <span className={`whitespace-nowrap font-bold text-[15px] transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* BOTTOM SECTION */}
                        <div className="p-3">
                            <div className="flex items-center gap-4 px-3 py-3 mb-1 rounded-xl border border-transparent">
                                <div className="w-10 h-10 rounded-full bg-ctu-lightblue flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-transparent">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                                <div className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    <p className="text-white text-[15px] font-extrabold truncate">Admin</p>
                                    <p className="text-slate-400 text-xs font-semibold truncate">Registrar's Office</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(true)}
                                onMouseEnter={() => setIsLogoutHovered(true)}
                                onMouseLeave={() => setIsLogoutHovered(false)}
                                className={`flex w-full items-center gap-4 px-3 py-3.5 text-left font-bold text-[15px] rounded-xl transition-all
                                    ${isLogoutHovered ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                `}
                                title={!isSidebarExpanded ? "Log Out" : undefined}
                            >
                                <i className={`fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg shrink-0 ${isLogoutHovered ? 'text-white' : 'text-slate-400'}`}></i>
                                <span className={`whitespace-nowrap transition-opacity duration-300 opacity-100 ${isSidebarExpanded ? 'md:opacity-100' : 'md:opacity-0'}`}>
                                    Log Out
                                </span>
                            </button>
                        </div>
                    </aside>
                )}

                {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10 min-w-0">

                    {/* TOP BAR */}
                    <header className="h-16 sm:h-20 bg-transparent border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden shrink-0">
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">Manage Events</h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <div className="relative w-64 hidden md:block group">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-ctu-lightblue transition-colors"></i>
                                <input type="text" placeholder="Search..." className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm focus:border-ctu-lightblue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-400 font-medium shadow-sm" />
                            </div>

                            {staffMode ? (
                                <StaffNotificationDropdown />
                            ) : (
                                <button aria-label="View notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:bg-slate-50 transition-colors shadow-sm">
                                    <i className="fa-regular fa-bell text-lg"></i>
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                </button>
                            )}

                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-up">

                            {/* EVENTS CALENDAR */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                                {/* Card Header */}
                                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">Events calendar</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-1">{visibleEvents.length} events</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowMyEventsOnly((current) => !current)}
                                            aria-pressed={showMyEventsOnly}
                                            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
                                                showMyEventsOnly
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <i className="fa-solid fa-user" aria-hidden="true" />
                                            My Events
                                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                showMyEventsOnly ? 'bg-white/20' : 'bg-slate-100'
                                            }`}>
                                                {myEvents.length}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                                            aria-label="Previous month"
                                            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center shrink-0"
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <h4 className="min-w-[120px] text-center text-sm font-extrabold text-slate-800">{monthLabel}</h4>
                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                                            aria-label="Next month"
                                            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center shrink-0"
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar */}
                                <div className="overflow-x-auto mobile-scroll-x">
                                    <div className="min-w-[700px]">
                                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                <div key={day} className="px-3 py-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7">
                                            {calendarDays.map((date) => {
                                                const dateKey = toDateKey(date);
                                                const dayEvents = eventsByDate[dateKey] ?? [];
                                                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                                                const isToday = dateKey === toDateKey(new Date());

                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDate(dateKey);
                                                            setIsEventEditorOpen(false);
                                                            setEditingEvent(null);
                                                        }}
                                                        aria-label={`${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}, ${dayEvents.length} events`}
                                                        key={dateKey}
                                                        className={`min-h-36 border-b border-r border-slate-100 p-2 text-left transition-colors hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ctu-lightblue ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/70'}`}
                                                    >
                                                        <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                            isToday ? 'bg-ctu-dark text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                                                        }`}>
                                                            {date.getDate()}
                                                        </span>
                                                        <span className="block space-y-1.5">
                                                            {dayEvents.slice(0, 2).map((event) => (
                                                                <span key={event.id} className="block rounded-md border border-blue-100 bg-blue-50 p-1.5">
                                                                    <span className="block truncate text-[11px] font-bold text-blue-900" title={event.title}>{event.title}</span>
                                                                    <span className="block truncate text-[10px] font-medium text-blue-700">
                                                                        {[formatTime(event.time), event.venue].filter(Boolean).join(' · ')}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                            {dayEvents.length > 2 && (
                                                                <span className="block text-[10px] font-bold text-slate-500">More</span>
                                                            )}
                                                            {dayEvents.length === 0 && (
                                                                <span className="block pt-1 text-[10px] font-semibold text-slate-400">+ Add event</span>
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>
                </div>

                {selectedDate && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
                            <div className="flex items-start justify-between border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        {isEventEditorOpen
                                            ? editingEvent ? 'Edit event' : 'Add event'
                                            : new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                    </h3>
                                    {!isEventEditorOpen && (
                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                            {(eventsByDate[selectedDate] ?? []).length} events
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeEventEditor();
                                        setSelectedDate(null);
                                    }}
                                    aria-label="Close"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            {isEventEditorOpen ? (
                                <form onSubmit={saveEvent} className="space-y-4 p-4 sm:p-6">
                                    <div>
                                        <label htmlFor="calendar-event-title" className="mb-1 block text-xs font-bold text-slate-700">Title</label>
                                        <input
                                            id="calendar-event-title"
                                            type="text"
                                            required
                                            maxLength={255}
                                            value={eventForm.data.title}
                                            onChange={(e) => eventForm.setData('title', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                        />
                                        {eventForm.errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.title}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="calendar-event-body" className="mb-1 block text-xs font-bold text-slate-700">Description</label>
                                        <textarea
                                            id="calendar-event-body"
                                            required
                                            rows={4}
                                            value={eventForm.data.body}
                                            onChange={(e) => eventForm.setData('body', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                        />
                                        {eventForm.errors.body && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.body}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="calendar-event-date" className="mb-1 block text-xs font-bold text-slate-700">Start date</label>
                                            <input
                                                id="calendar-event-date"
                                                type="date"
                                                required
                                                value={eventForm.data.event_date}
                                                onChange={(e) => {
                                                    const eventDate = e.target.value;
                                                    eventForm.setData((data) => ({
                                                        ...data,
                                                        event_date: eventDate,
                                                        event_end_date: data.event_end_date < eventDate ? eventDate : data.event_end_date,
                                                    }));
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                            />
                                            {eventForm.errors.event_date && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.event_date}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="calendar-event-end-date" className="mb-1 block text-xs font-bold text-slate-700">End date</label>
                                            <input
                                                id="calendar-event-end-date"
                                                type="date"
                                                required
                                                min={eventForm.data.event_date}
                                                value={eventForm.data.event_end_date}
                                                onChange={(e) => eventForm.setData('event_end_date', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                            />
                                            {eventForm.errors.event_end_date && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.event_end_date}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="calendar-event-location" className="mb-1 block text-xs font-bold text-slate-700">Location</label>
                                            <input
                                                id="calendar-event-location"
                                                type="text"
                                                required
                                                maxLength={255}
                                                value={eventForm.data.location}
                                                onChange={(e) => eventForm.setData('location', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                            />
                                            {eventForm.errors.location && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.location}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <EventTimePicker
                                            id="calendar-event-start"
                                            label="Start time"
                                            parts={startTimeParts}
                                            error={eventForm.errors.start_time}
                                            onChange={(part, value) => updateEventTime('start_time', part, value)}
                                        />
                                        <EventTimePicker
                                            id="calendar-event-end"
                                            label="End time"
                                            parts={endTimeParts}
                                            error={eventForm.errors.end_time}
                                            onChange={(part, value) => updateEventTime('end_time', part, value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="calendar-event-poster" className="mb-1 block text-xs font-bold text-slate-700">Posted by</label>
                                        <input
                                            id="calendar-event-poster"
                                            type="text"
                                            required
                                            maxLength={255}
                                            value={eventForm.data.posted_by}
                                            readOnly={staffMode && staffDepartment !== null}
                                            onChange={(e) => eventForm.setData('posted_by', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-ctu-lightblue focus:outline-none"
                                        />
                                        {eventForm.errors.posted_by && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.posted_by}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="calendar-event-image" className="mb-1 block text-xs font-bold text-slate-700">Cover image</label>
                                        {editingEvent?.image_url && !eventForm.data.image && (
                                            <img
                                                src={editingEvent.image_url}
                                                alt="Current event cover"
                                                className="mb-2 max-h-48 w-full rounded-lg border border-slate-200 object-cover"
                                            />
                                        )}
                                        <input
                                            id="calendar-event-image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={(e) => {
                                                const image = e.target.files?.[0] ?? null;
                                                eventForm.setData('image', image);
                                                setSelectedImageName(image?.name ?? '');
                                            }}
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700"
                                        />
                                        {selectedImageName && <p className="mt-1 text-xs text-slate-500">{selectedImageName}</p>}
                                        <p className="mt-1 text-[11px] text-slate-500">JPG, PNG, GIF or WebP · up to 5 MB</p>
                                        {eventForm.errors.image && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.image}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="calendar-event-attachments" className="mb-1 block text-xs font-bold text-slate-700">Downloadable documents</label>
                                        {editingEvent?.attachments
                                            .filter((attachment) => !eventForm.data.remove_attachments.includes(attachment.path))
                                            .map((attachment) => (
                                                <div key={attachment.path} className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="min-w-0 truncate text-xs font-semibold text-blue-700 hover:underline"
                                                    >
                                                        {attachment.name}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => eventForm.setData('remove_attachments', [
                                                            ...eventForm.data.remove_attachments,
                                                            attachment.path,
                                                        ])}
                                                        className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        <input
                                            id="calendar-event-attachments"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.ods,.odp"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files ?? []);
                                                eventForm.setData('attachments', files);
                                                setSelectedAttachmentNames(files.map((file) => file.name));
                                            }}
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700"
                                        />
                                        {selectedAttachmentNames.length > 0 && (
                                            <p className="mt-1 text-xs text-slate-500">{selectedAttachmentNames.join(', ')}</p>
                                        )}
                                        <p className="mt-1 text-[11px] text-slate-500">Up to 10 files, 10 MB each. Documents only.</p>
                                        {eventForm.errors.attachments && <p className="mt-1 text-xs font-semibold text-rose-600">{eventForm.errors.attachments}</p>}
                                        {Object.entries(eventForm.errors)
                                            .filter(([key]) => key.startsWith('attachments.'))
                                            .map(([key, error]) => (
                                                <p key={key} className="mt-1 text-xs font-semibold text-rose-600">{error}</p>
                                            ))}
                                    </div>
                                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeEventEditor}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={eventForm.processing}
                                            className="rounded-lg bg-ctu-dark px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            {eventForm.processing ? 'Saving...' : editingEvent ? 'Save changes' : 'Create event'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3 p-4 sm:p-6">
                                    {(eventsByDate[selectedDate] ?? []).length === 0 ? (
                                        <p className="rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-500">
                                            No events on this day yet.
                                        </p>
                                    ) : (eventsByDate[selectedDate] ?? []).map((event) => (
                                        <div key={event.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-slate-900">{event.title}</p>
                                                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                                    {[formatTime(event.time), event.venue].filter(Boolean).join(' · ')}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEventEditor(event)}
                                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEventToDelete(event)}
                                                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => openEventEditor()}
                                        className="w-full rounded-lg bg-ctu-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                                    >
                                        <i className="fa-solid fa-plus mr-2"></i>Add event on this day
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRMATION MODAL */}
                {eventToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">

                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete this event?</h3>
                            <p className="text-sm font-medium text-slate-600 mb-2 leading-relaxed">
                                <strong className="text-slate-900">"{eventToDelete.title}"</strong> will be removed for all students. This can't be undone.
                            </p>
                            <p className="text-xs font-medium text-slate-400 mb-8">This action cannot be undone.</p>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setEventToDelete(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    </div>
                )}

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
    );
}