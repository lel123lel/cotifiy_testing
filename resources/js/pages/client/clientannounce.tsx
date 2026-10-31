import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type AnnouncementCategory = 'Academic' | 'Event' | 'General' | 'Service';

interface Announcement {
    id: number;
    title: string;
    category: AnnouncementCategory;
    posted_by: string;
    date: string;
    content: string;
    image: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
}

interface ClientAnnouncementsProps {
    announcements: Announcement[];
}

const categories: Array<'All' | AnnouncementCategory> = [
    'All',
    'Academic',
    'Event',
    'General',
    'Service',
];

const categoryStyles: Record<AnnouncementCategory, string> = {
    Academic: 'bg-blue-50 text-blue-700 ring-blue-200',
    Event: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    General: 'bg-slate-100 text-slate-700 ring-slate-200',
    Service: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ClientAnnouncements({
    announcements,
}: ClientAnnouncementsProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name ?? 'Student';
    const [activeCategory, setActiveCategory] =
        useState<(typeof categories)[number]>('All');
    const [search, setSearch] = useState('');

    const filteredAnnouncements = useMemo(() => {
        const query = search.trim().toLowerCase();

        return announcements.filter((announcement) => {
            const matchesCategory =
                activeCategory === 'All' ||
                announcement.category === activeCategory;
            const matchesSearch =
                !query ||
                [
                    announcement.title,
                    announcement.content,
                    announcement.posted_by,
                ].some((value) => value.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, announcements, search]);

    return (
        <>
            <Head title="Announcements | COTIFY" />
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="bg-ctu-dark sticky top-0 z-20 border-b border-white/10 shadow-lg">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:h-20 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-8">
                            <Link
                                href="/client"
                                className="flex shrink-0 items-center gap-2"
                            >
                                <img
                                    src="/images/3rdLogo.png"
                                    alt="Cotify"
                                    className="h-10 w-10 object-contain"
                                />
                                <span className="hidden text-xl font-extrabold text-white sm:block">
                                    Cotify
                                </span>
                            </Link>
                            <nav
                                aria-label="Client navigation"
                                className="hidden items-center gap-6 md:flex"
                            >
                                <Link
                                    href="/client"
                                    className="text-sm font-semibold text-slate-300 transition hover:text-white"
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/client/announcements"
                                    aria-current="page"
                                    className="border-ctu-lightblue border-b-2 py-1 text-sm font-bold text-white"
                                >
                                    Announcements
                                </Link>
                                <Link
                                    href="/client/events"
                                    className="text-sm font-semibold text-slate-300 transition hover:text-white"
                                >
                                    Events
                                </Link>
                                <Link
                                    href="/client/saved"
                                    className="text-sm font-semibold text-slate-300 transition hover:text-white"
                                >
                                    Saved
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative hidden sm:block">
                                <span className="sr-only">
                                    Search announcements
                                </span>
                                <i
                                    className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"
                                    aria-hidden="true"
                                ></i>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search announcements"
                                    className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/30 w-56 rounded-lg border border-slate-700 bg-slate-800 py-2 pr-3 pl-9 text-sm text-white outline-none placeholder:text-slate-400 focus:ring-2 lg:w-64"
                                />
                            </label>
                            <div
                                className="bg-ctu-lightblue flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                                aria-label={`Signed in as ${userName}`}
                            >
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden text-sm font-semibold text-white lg:block">
                                {userName}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <section className="from-ctu-dark mb-8 rounded-3xl bg-gradient-to-r to-slate-800 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10">
                        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-sky-300 uppercase">
                            Campus updates
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Announcements
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            Stay up to date with academic notices, campus
                            services, and important community news.
                        </p>
                        <label className="relative mt-6 block sm:hidden">
                            <span className="sr-only">
                                Search announcements
                            </span>
                            <i
                                className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"
                                aria-hidden="true"
                            ></i>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search announcements"
                                className="focus:border-ctu-lightblue focus:ring-ctu-lightblue/30 w-full rounded-lg border border-slate-600 bg-slate-900/50 py-2.5 pr-3 pl-9 text-sm text-white outline-none placeholder:text-slate-400 focus:ring-2"
                            />
                        </label>
                    </section>

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Latest updates
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {filteredAnnouncements.length}{' '}
                                {filteredAnnouncements.length === 1
                                    ? 'announcement'
                                    : 'announcements'}
                            </p>
                        </div>
                        <div
                            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                            role="group"
                            aria-label="Filter announcements by category"
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    aria-pressed={activeCategory === category}
                                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                                        activeCategory === category
                                            ? 'border-ctu-dark bg-ctu-dark text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    {category === 'Event' ? 'Events' : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredAnnouncements.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <i
                                    className="fa-regular fa-newspaper text-2xl"
                                    aria-hidden="true"
                                ></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                No announcements found
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {search || activeCategory !== 'All'
                                    ? 'Try another search or category.'
                                    : 'There are no announcements to show right now.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {filteredAnnouncements.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {announcement.image ? (
                                        <img
                                            src={announcement.image}
                                            alt=""
                                            className="h-48 w-full bg-slate-100 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                            <i
                                                className="fa-regular fa-newspaper text-3xl"
                                                aria-hidden="true"
                                            ></i>
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase ring-1 ring-inset ${categoryStyles[announcement.category]}`}
                                            >
                                                {announcement.category}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">
                                                {formatDate(announcement.date)}
                                            </span>
                                        </div>
                                        <h3 className="group-hover:text-ctu-lightblue text-lg leading-snug font-bold text-slate-900 transition">
                                            {announcement.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                                            {announcement.content}
                                        </p>
                                        <div className="mt-5 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                            <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
                                                <i
                                                    className="fa-solid fa-building text-slate-400"
                                                    aria-hidden="true"
                                                ></i>
                                                <span className="truncate">
                                                    {announcement.posted_by}
                                                </span>
                                            </span>
                                            <Link
                                                href={`/client/announcements/${announcement.id}`}
                                                className="hover:border-ctu-lightblue hover:text-ctu-lightblue inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
                                            >
                                                Read announcement
                                                <i
                                                    className="fa-solid fa-arrow-right text-[10px]"
                                                    aria-hidden="true"
                                                ></i>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
