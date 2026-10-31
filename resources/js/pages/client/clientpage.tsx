import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by_office: string;
    date: string;
    content: string;
    image: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
}

interface ClientHomeProps {
    announcements?: Announcement[];
    upcomingEvents?: Announcement[];
    unreadCount?: number;
    isLoading?: boolean;
    hasError?: boolean;
    user?: {
        name: string;
        course: string;
        year_level: string;
    };
}

export default function ClientHome({
    announcements = [],
    upcomingEvents = [],
    unreadCount = 0,
    isLoading = false,
    hasError = false,
    user = { name: 'Juan', course: 'BSIT', year_level: '3rd Year' },
}: ClientHomeProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || user.name;

    const [activeFilter, setActiveFilter] = useState<
        'all' | 'Academic' | 'Event' | 'General' | 'Service'
    >('all');
    const [searchTerm, setSearchTerm] = useState('');
    const filteredAnnouncements = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase();

        return announcements.filter((announcement) => {
            const matchesFilter =
                activeFilter === 'all' ||
                announcement.category === activeFilter;
            const matchesSearch =
                !query ||
                announcement.title.toLocaleLowerCase().includes(query) ||
                announcement.posted_by_office
                    .toLocaleLowerCase()
                    .includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, announcements, searchTerm]);

    const formatDate = (date: string) =>
        new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const formatTime = (time: string | null) =>
        time
            ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
              })
            : '';

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Academic':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Event':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <>
            <Head title="Home | COTIFY" />

            <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
                {/* ==================== */}
                {/* 1. TOP NAVIGATION    */}
                {/* ==================== */}
                <header className="bg-ctu-dark/95 relative z-50 border-b border-white/10 shadow-lg backdrop-blur-xl">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
                            <div className="flex items-center gap-8">
                                <Link
                                    href="/client"
                                    className="flex shrink-0 items-center"
                                >
                                    <img
                                        src="/images/3rdLogo.png"
                                        alt="Cotify"
                                        className="-mr-3 -ml-1 h-10 w-10 object-contain sm:h-12 sm:w-12"
                                    />
                                    <span className="hidden text-xl font-extrabold text-white sm:block">
                                        Cotify
                                    </span>
                                </Link>

                                <nav className="hidden items-center gap-6 md:flex">
                                    <Link
                                        href="/client"
                                        className="border-ctu-lightblue border-b-2 pb-1 text-sm font-bold text-white"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/client/announcements"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Announcements
                                    </Link>
                                    <Link
                                        href="/client/events"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Events
                                    </Link>
                                    <Link
                                        href="/client/saved"
                                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                                    >
                                        Saved
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative hidden sm:block">
                                    <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"></i>
                                    <input
                                        type="text"
                                        placeholder="Search announcements..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="focus:ring-ctu-lightblue w-64 rounded-lg border border-slate-700 bg-slate-800/50 py-2 pr-4 pl-9 text-sm text-white placeholder-slate-400 transition-all outline-none focus:ring-2"
                                    />
                                </div>

                                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-800">
                                    <i className="fa-regular fa-bell text-xl"></i>
                                    {unreadCount > 0 && (
                                        <span className="border-ctu-dark absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="group flex cursor-pointer items-center gap-2 border-l border-slate-700 pl-2 sm:pl-4">
                                    <div className="bg-ctu-lightblue flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden text-sm font-semibold text-white lg:block">
                                        {userName.split(' ')[0]} D.
                                    </span>
                                    <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    {/* 2. GREETING + SUMMARY */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                            Good morning, {userName.split(' ')[0]}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                            {user.course || 'Course not set'} · {user.year_level || 'Year level not set'} ·{' '}
                            <span className="text-ctu-lightblue font-bold">
                                {unreadCount} new announcements
                            </span>{' '}
                            since your last visit · 1 event this week
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* LEFT COLUMN: FEED */}
                        <div className="space-y-6 lg:col-span-8">
                            {/* 4. FILTER CHIPS */}
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
                                    {[
                                        'all',
                                        'Academic',
                                        'Event',
                                        'General',
                                        'Service',
                                    ].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() =>
                                                setActiveFilter(tab as any)
                                            }
                                            className={`rounded-full border px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                                                activeFilter === tab
                                                    ? 'bg-ctu-lightblue border-ctu-lightblue text-white shadow-md'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {tab === 'all'
                                                ? 'All'
                                                : tab === 'Event'
                                                  ? 'Events'
                                                  : tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="shrink-0 text-xs font-semibold text-slate-500">
                                    Sort: Newest{' '}
                                    <i className="fa-solid fa-chevron-down ml-1 text-[10px]"></i>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                                        >
                                            <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200"></div>
                                            <div className="flex-1 space-y-3 py-1">
                                                <div className="h-4 w-1/4 rounded bg-slate-200"></div>
                                                <div className="h-5 w-3/4 rounded bg-slate-200"></div>
                                                <div className="h-4 w-full rounded bg-slate-200"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasError && !isLoading && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                                    <h3 className="text-lg font-bold text-red-800">
                                        Unable to load announcements
                                    </h3>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isLoading && !hasError && (
                                <div className="space-y-4">
                                    {/* 5. ONE CARD STYLE PER ANNOUNCEMENT */}
                                    {filteredAnnouncements.map((ann) => (
                                        <div
                                            key={ann.id}
                                            className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            {/* Image / Placeholder */}
                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                                                {ann.image ? (
                                                    <img
                                                        src={ann.image}
                                                        alt={ann.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <i className="fa-regular fa-newspaper text-3xl text-slate-300"></i>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                <div>
                                                    <div className="mb-1.5 flex items-center gap-2">
                                                        <span
                                                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold tracking-widest uppercase ${getCategoryColor(ann.category)}`}
                                                        >
                                                            {ann.category ===
                                                            'Event'
                                                                ? 'Events'
                                                                : ann.category ===
                                                                    'Academic'
                                                                  ? 'Academic'
                                                                  : 'Services'}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            {formatDate(
                                                                ann.date,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <h3 className="hover:text-ctu-lightblue mb-1 cursor-pointer text-lg leading-snug font-bold text-slate-900 transition-colors">
                                                        {ann.title}
                                                    </h3>
                                                    <p className="line-clamp-1 text-sm text-slate-500">
                                                        {ann.content}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-400">
                                                            <i className="fa-solid fa-building"></i>
                                                        </div>
                                                        {ann.posted_by_office}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            href={`/client/announcements/${ann.id}`}
                                                            className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                                        >
                                                            Read more
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredAnnouncements.length === 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                                <i className="fa-regular fa-folder-open text-2xl text-slate-300"></i>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                No updates found
                                            </h3>
                                        </div>
                                    )}

                                    {/* Load More */}
                                    {announcements.length === 10 && (
                                        <div className="pt-2 text-center">
                                            <Link
                                                href="/client/announcements"
                                                className="inline-flex rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                                            >
                                                View all announcements
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <aside className="space-y-6 lg:col-span-4">
                            {/* 6. EVENTS PANEL */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Upcoming events
                                    </h3>
                                    <Link
                                        href="/client/events"
                                        className="hover:text-ctu-lightblue text-xs font-bold text-slate-500"
                                    >
                                        View all
                                    </Link>
                                </div>

                                <div className="space-y-4 p-4">
                                    {/* Event List */}
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex gap-3"
                                        >
                                            <div className="h-fit min-w-[50px] shrink-0 rounded-lg bg-slate-100 p-2 text-center">
                                                <p className="text-[9px] font-extrabold text-slate-500 uppercase">
                                                    {new Date(
                                                        `${event.event_date}T00:00:00`,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        { month: 'short' },
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-lg leading-none font-black text-slate-800">
                                                    {new Date(
                                                        `${event.event_date}T00:00:00`,
                                                    ).getDate()}
                                                </p>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="mb-1 line-clamp-1 text-sm leading-tight font-bold text-slate-900">
                                                    {event.title}
                                                </h4>
                                                <p className="text-[11px] font-semibold text-slate-500">
                                                    {formatTime(
                                                        event.start_time,
                                                    )}{' '}
                                                    · {event.location}
                                                </p>
                                                <Link
                                                    href={`/client/announcements/${event.id}`}
                                                    className="text-ctu-lightblue mt-2 inline-flex text-xs font-bold hover:underline"
                                                >
                                                    View event details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingEvents.length === 0 && (
                                        <p className="py-3 text-center text-xs font-medium text-slate-500">
                                            No upcoming events.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                {/* ==================== */}
                {/* FOOTER               */}
                {/* ==================== */}
                <footer className="bg-ctu-dark relative z-10 mt-auto border-t border-slate-800 py-6 text-white">
                    <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">
                                &copy; 2026 Cotify · College of Technology
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                About
                            </a>
                            <span>·</span>
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                Contact
                            </a>
                            <span>·</span>
                            <a
                                href="#"
                                className="transition-colors hover:text-white"
                            >
                                Privacy
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
