import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface Announcement {
    id: number;
    title: string;
    category: 'Academic' | 'Event' | 'General' | 'Service';
    posted_by: string;
    date: string;
    content: string;
    image: string;
}

interface ClientProps {
    userName?: string;
    isLoggedIn?: boolean;
}

export default function Client({ userName = 'Guest', isLoggedIn = false }: ClientProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    
    const announcements: Announcement[] = [
        {
            id: 1,
            title: 'Enrollment Schedule for 1st Semester, SY 2025-2026',
            category: 'Academic',
            posted_by: 'Office of the Registrar',
            date: 'Sep 5, 2025',
            content:
                'Enrollment for the 1st Semester of SY 2025-2026 will begin on September 15, 2025. Please prepare your requirements and proceed to your respective departments. Late enrollees will be subject to a fee.',
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 2,
            title: 'Suspension of Classes (September 8, 2025)',
            category: 'General',
            posted_by: 'COTIFY Administration',
            date: 'Sep 5, 2025',
            content:
                'Due to the incoming typhoon, classes at all levels are suspended on September 8, 2025. Please stay safe and monitor official channels for updates.',
            image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 3,
            title: 'HIV/AIDS Awareness Seminar',
            category: 'Event',
            posted_by: 'Student Affairs and Services',
            date: 'Dec 3, 2023',
            content:
                'Join us for an informative seminar on HIV/AIDS awareness. Learn about prevention, testing, and support resources available on campus. Open to all students and staff.',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 4,
            title: 'Online Registration is Now Open',
            category: 'Service',
            posted_by: "Registrar's Office",
            date: 'Aug 27, 2025',
            content:
                'The online registration portal is now open. Log in to your student account to register for your courses. Deadline for registration is September 30, 2025.',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 5,
            title: 'College Intramurals 2025',
            category: 'Event',
            posted_by: 'Sports Development Office',
            date: 'Dec 10, 2025',
            content:
                'Get ready for the annual College Intramurals! Join your department team and compete in various sports. Registration is open until December 1, 2025.',
            image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 6,
            title: 'Library Extended Hours During Finals',
            category: 'Academic',
            posted_by: 'Library Services',
            date: 'Nov 28, 2025',
            content:
                'The library will be open from 7:00 AM to 10:00 PM during the final examination period to provide students with ample study time.',
            image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
        },
    ];

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((a) => {
            const matchesCategory = activeFilter === 'all' || a.category === activeFilter;
            const matchesSearch =
                searchTerm === '' ||
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.posted_by.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeFilter, searchTerm]);

    const getBadgeClass = (category: Announcement['category']): string => {
        switch (category) {
            case 'Academic':
                return 'bg-blue-100 text-blue-700';
            case 'Event':
                return 'bg-emerald-100 text-emerald-700';
            case 'Service':
                return 'bg-rose-100 text-rose-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const filterTabs = ['all', 'Academic', 'Event', 'General', 'Service'];

    return (
        <>
            <Head title="Home" />
            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen">

                <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">

                            <Link href="/client" className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-ctu-dark flex items-center justify-center">
                                    <i className="fa-solid fa-gear text-white text-lg"></i>
                                </div>
                                <div>
                                    <h1 className="font-bold text-ctu-dark text-sm leading-tight">COTIFY</h1>
                                    <p className="text-[10px] text-slate-500">College of Technology</p>
                                </div>
                            </Link>

                            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                                <Link href="/client" className="text-ctu-lightblue border-b-2 border-ctu-lightblue pb-1">
                                    Home
                                </Link>
                                <a href="#announcements" className="text-slate-600 hover:text-ctu-lightblue transition-colors">
                                    Announcements
                                </a>
                                <a href="#events" className="text-slate-600 hover:text-ctu-lightblue transition-colors">
                                    Events
                                </a>
                                <a href="#about" className="text-slate-600 hover:text-ctu-lightblue transition-colors">
                                    About
                                </a>
                            </nav>

                            <div className="flex items-center gap-3">
                                <div className="relative hidden md:block">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search announcements..."
                                        className="w-48 lg:w-64 pl-8 pr-3 py-1.5 bg-slate-100 border-transparent rounded-lg text-xs focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>

                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-ctu-lightblue flex items-center justify-center text-white text-xs font-semibold">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
                                        <i className="fa-solid fa-chevron-down text-xs text-slate-400 hidden sm:block"></i>
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="p-2">
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-regular fa-user w-4 text-center text-slate-400"></i> My Profile
                                            </a>
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-regular fa-bell w-4 text-center text-slate-400"></i> Notifications
                                            </a>
                                            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                                <i className="fa-solid fa-gear w-4 text-center text-slate-400"></i> Settings
                                            </a>
                                            <hr className="my-1 border-slate-100" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                    className="lg:hidden text-slate-600 hover:text-ctu-lightblue text-xl"
                                    aria-label="Toggle menu"
                                >
                                    <i className={`fa-solid ${mobileNavOpen ? 'fa-times' : 'fa-bars'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {mobileNavOpen && (
                        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2">
                            <Link href="/client" className="block px-3 py-2 rounded-lg text-sm font-medium text-ctu-lightblue bg-blue-50">
                                Home
                            </Link>
                            <a href="#announcements" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Announcements
                            </a>
                            <a href="#events" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Events
                            </a>
                            <a href="#about" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                About
                            </a>
                            <div className="relative mt-2">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search announcements..."
                                    className="w-full pl-8 pr-3 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                </header>

                <section className="relative pt-16">
                    <div className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                                alt="University Campus"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-ctu-dark via-ctu-dark/90 to-ctu-dark/50"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="max-w-2xl">
                                <p className="text-ctu-lightblue font-semibold tracking-widest text-xs uppercase mb-3">
                                    Welcome to COTIFY
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                                    Stay Updated with
                                    <br />
                                    <span className="text-blue-400">Campus Announcements</span>
                                </h1>
                                <p className="text-slate-300 text-base lg:text-lg mb-8 max-w-xl">
                                    Your one-stop portal for the latest news, events, and important updates from the College of Technology.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <a
                                        href="#announcements"
                                        className="bg-ctu-lightblue hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        <i className="fa-solid fa-bullhorn"></i> Browse Announcements
                                    </a>
                                    <a
                                        href="#events"
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <i className="fa-regular fa-calendar"></i> Upcoming Events
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">24</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Announcements</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">8</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Upcoming Events</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">156</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Active Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ctu-lightblue">12</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Departments</p>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2">
                            <div id="announcements" className="scroll-mt-20">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Latest Announcements</h2>
                                        <p className="text-sm text-slate-500">Stay informed with what's happening on campus</p>
                                    </div>
                                    <a href="#" className="text-sm text-ctu-lightblue hover:underline font-medium flex items-center gap-1">
                                        View All <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                </div>

                                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
                                    {filterTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                                activeFilter === tab
                                                    ? 'bg-ctu-lightblue text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {tab === 'all' ? 'All' : tab === 'Event' ? 'Events' : tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {filteredAnnouncements.map((ann) => (
                                        <article
                                            key={ann.id}
                                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                                                    <img
                                                        src={ann.image}
                                                        alt={ann.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 p-5 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getBadgeClass(ann.category)}`}>
                                                                {ann.category}
                                                            </span>
                                                            <span className="text-xs text-slate-400">{ann.date}</span>
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-ctu-lightblue transition-colors">
                                                            {ann.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                            {ann.content}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                                <i className="fa-solid fa-building text-[10px]"></i>
                                                            </div>
                                                            <span className="text-xs text-slate-500 font-medium">{ann.posted_by}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedAnnouncement(ann)}
                                                            className="text-xs text-ctu-lightblue hover:underline font-medium flex items-center gap-1"
                                                        >
                                                            Read More <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>


                                {filteredAnnouncements.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <i className="fa-solid fa-magnifying-glass text-slate-400 text-xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 mb-1">No announcements found</h3>
                                        <p className="text-sm text-slate-500">
                                            Try adjusting your search or filter to find what you're looking for.
                                        </p>
                                    </div>
                                )}


                                {filteredAnnouncements.length > 0 && (
                                    <div className="text-center mt-8">
                                        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2">
                                            <i className="fa-solid fa-rotate"></i> Load More Announcements
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-6">
 
                            <div id="events" className="bg-white rounded-2xl border border-slate-200 overflow-hidden scroll-mt-20">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <i className="fa-regular fa-calendar text-ctu-lightblue"></i> Upcoming Events
                                    </h3>
                                    <a href="#" className="text-xs text-ctu-lightblue hover:underline">
                                        View All
                                    </a>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[
                                        { date: '03', title: 'HIV/AIDS Awareness Seminar', time: '9:00 AM - 12:00 PM', location: 'SAC' },
                                        { date: '10', title: 'College Intramurals', time: '8:00 AM - 5:00 PM', location: 'COTIFY Gym' },
                                        { date: '15', title: 'Midterm Examination', time: '7:00 AM - 10:00 PM', location: 'Various Rooms' },
                                    ].map((event, idx) => (
                                        <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div className="bg-ctu-lightblue text-white rounded-lg p-2 text-center min-w-[50px] shrink-0">
                                                <p className="text-[10px] font-bold uppercase">Dec</p>
                                                <p className="text-lg font-bold leading-none">{event.date}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1">{event.title}</h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <i className="fa-regular fa-clock"></i> {event.time}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <i className="fa-solid fa-location-dot"></i> {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <i className="fa-solid fa-tags text-ctu-lightblue"></i> Categories
                                    </h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    {[
                                        { name: 'Academic', count: 8, icon: 'fa-graduation-cap', color: 'text-ctu-lightblue', badge: 'bg-blue-100 text-blue-700' },
                                        { name: 'Events', count: 5, icon: 'fa-calendar-check', color: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
                                        { name: 'General', count: 7, icon: 'fa-bullhorn', color: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' },
                                        { name: 'Service', count: 4, icon: 'fa-hand-holding-heart', color: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
                                    ].map((cat) => (
                                        <a
                                            key={cat.name}
                                            href="#"
                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                        >
                                            <span className="text-sm text-slate-600 flex items-center gap-3">
                                                <i className={`fa-solid ${cat.icon} ${cat.color} w-4 text-center`}></i> {cat.name}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.badge}`}>
                                                {cat.count}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div id="about" className="bg-ctu-dark rounded-2xl p-6 text-white relative overflow-hidden scroll-mt-20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ctu-lightblue/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-gear text-white text-lg"></i>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">About COTIFY</h3>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                        COTIFY is the official announcement and event management system for the College of Technology. Stay connected with your campus community.
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 text-sm text-ctu-lightblue hover:text-white font-medium transition-colors"
                                    >
                                        Learn More <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
                                    <i className="fa-regular fa-envelope text-ctu-lightblue"></i> Subscribe to Updates
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">Get the latest announcements straight to your inbox.</p>
                                <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </aside>
                    </div>
                </main>

                <footer className="bg-ctu-dark text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                        <i className="fa-solid fa-gear text-ctu-dark text-lg"></i>
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-white text-sm leading-tight">COTIFY</h1>
                                        <p className="text-[10px] text-slate-400">College of Technology</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                                    The official announcement and event management portal of the College of Technology. Stay informed, stay connected.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li><Link href="/client" className="hover:text-white transition-colors">Home</Link></li>
                                    <li><a href="#announcements" className="hover:text-white transition-colors">Announcements</a></li>
                                    <li><a href="#events" className="hover:text-white transition-colors">Events</a></li>
                                    <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex items-center gap-2"><i className="fa-solid fa-location-dot w-4 text-ctu-lightblue"></i> Cotify City, Cebu</li>
                                    <li className="flex items-center gap-2"><i className="fa-regular fa-envelope w-4 text-ctu-lightblue"></i> info@cotify.edu.ph</li>
                                    <li className="flex items-center gap-2"><i className="fa-solid fa-phone w-4 text-ctu-lightblue"></i> (032) 123-4567</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} COTIFY. All rights reserved.</p>
                            <div className="flex items-center gap-4 text-slate-400">
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-facebook"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-instagram"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>
                </footer>

                {selectedAnnouncement && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedAnnouncement(null)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-md transition-colors z-10"
                                aria-label="Close"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>


                            <div className="h-56 overflow-hidden rounded-t-2xl">
                                <img
                                    src={selectedAnnouncement.image}
                                    alt={selectedAnnouncement.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getBadgeClass(selectedAnnouncement.category)}`}>
                                        {selectedAnnouncement.category}
                                    </span>
                                    <span className="text-xs text-slate-400">{selectedAnnouncement.date}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
                                    {selectedAnnouncement.title}
                                </h2>
                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <i className="fa-solid fa-building text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Posted by</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAnnouncement.posted_by}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {selectedAnnouncement.content}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                                    <button className="bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                                        <i className="fa-regular fa-bookmark"></i> Save for Later
                                    </button>
                                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                                        <i className="fa-solid fa-share-nodes"></i> Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}