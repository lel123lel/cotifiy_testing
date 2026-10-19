import { Head } from '@inertiajs/react';



export default function admin() {
    return (
        <>
            <Head title="Admin" />
            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden">
                
                <aside id="sidebar" className="w-64 bg-ctu-dark flex flex-col justify-between shrink-0 absolute md:relative z-30 h-full transition-all duration-300">
                    <div>
                        
                        <div className="p-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-sm"></i>
                            </div>
                            <div className="text-white">
                                <h1 className="font-bold text-sm leading-tight">COTIFY</h1>
                                <p className="text-[10px] text-slate-400">College of Technology</p>
                            </div>
                        </div>
                        
                        
                        <div className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Admin</p>
                                <p className="text-slate-400 text-xs">Administrator</p>
                            </div>
                        </div>

                        
                        <nav className="mt-4 space-y-1 px-3" id="sidebarNav">
                            <a href="#dashboard" data-target="dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 bg-ctu-lightblue text-white rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-house w-5 text-center"></i> Dashboard
                            </a>
                            <a href="#announcements" data-target="announcements" className="nav-link flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-bullhorn w-5 text-center"></i> Announcements
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-regular fa-calendar w-5 text-center"></i> Events
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-users w-5 text-center"></i> Users
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-regular fa-building w-5 text-center"></i> Departments
                            </a>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                                <i className="fa-solid fa-gear w-5 text-center"></i> Settings
                            </a>
                        </nav>
                    </div>

                    
                    <div className="p-4 border-t border-slate-800">
                        <a href="login.php" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> Log Out
                        </a>
                    </div>
                </aside>

                
                <div id="sidebarOverlay" className="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>

                
                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
                    
                    
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex items-center gap-4">
                            
                            <button id="toggleSidebarBtn" className="text-slate-500 hover:text-ctu-lightblue text-lg transition-colors" title="Toggle Navigation Bar">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            
                            <button id="mobileSidebarBtn" className="md:hidden text-slate-500 hover:text-slate-800 text-lg hidden">
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <div className="relative w-64 hidden sm:block">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                <input type="text" id="globalSearch" placeholder="Search announcements..." className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all"></input>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-slate-400 hover:text-slate-600 relative">
                                <i className="fa-regular fa-bell text-lg"></i>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <i className="fa-solid fa-user text-xs"></i>
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
                                <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
                            </div>
                        </div>
                    </header>

                    
                    <main className="flex-1 p-6 overflow-y-auto">
                        
                        
                        <section id="dashboard" className="mb-10 section-content">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
                                <p className="text-sm text-slate-500">Overview of system activity</p>
                            </div>

                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <i className="fa-solid fa-bullhorn text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Announcements</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1" id="statTotalAnnouncements">24</h3>
                                        <p className="text-[10px] text-emerald-600 font-medium"><i className="fa-solid fa-arrow-up"></i> 12% this month</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                        <i className="fa-regular fa-calendar text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Events</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">8</h3>
                                        <p className="text-[10px] text-emerald-600 font-medium"><i className="fa-solid fa-arrow-up"></i> 33% this month</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                        <i className="fa-solid fa-users text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Users</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">156</h3>
                                        <p className="text-[10px] text-emerald-600 font-medium"><i className="fa-solid fa-arrow-up"></i> 5% this month</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                        <i className="fa-solid fa-building text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Departments</p>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">12</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">No change</p>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-700">Recent Announcements</h4>
                                        <a href="#announcements" className="text-xs text-ctu-lightblue hover:underline font-medium">View All</a>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Academic</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 mb-1">Enrollment Schedule for 1st Semester, SY 2025-2026</p>
                                            <p className="text-xs text-slate-500">Sep 5, 2025 • Office of the Registrar</p>
                                        </div>
                                        <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Event</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 mb-1">HIV/AIDS Awareness Seminar</p>
                                            <p className="text-xs text-slate-500">Dec 3, 2023 • Student Affairs and Services</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-700">Upcoming Events</h4>
                                        <a href="#" className="text-xs text-ctu-lightblue hover:underline font-medium">View All</a>
                                    </div>
                                    <div className="p-4 space-y-4 flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[50px]">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Dec</p>
                                                <p className="text-lg font-bold text-slate-800 leading-none">03</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">HIV/AIDS Awareness Seminar</p>
                                                <p className="text-xs text-slate-500">9:00 AM - 12:00 PM • SAC</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[50px]">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Dec</p>
                                                <p className="text-lg font-bold text-slate-800 leading-none">10</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">College Intramurals</p>
                                                <p className="text-xs text-slate-500">8:00 AM - 5:00 PM • COTIFY Gym</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-200 mb-10"></hr>

                        
                        <section id="announcements" className="section-content">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Manage Announcements</h2>
                                    <p className="text-sm text-slate-500">Create, edit, and manage all announcements.</p>
                                </div>
                                <button id="btnNewAnnouncement" className="bg-ctu-lightblue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0">
                                    <i className="fa-solid fa-plus"></i> New Announcement
                                </button>
                            </div>

                            
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar" id="filterTabs">
                                <button data-filter="all" className="filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-ctu-lightblue text-white whitespace-nowrap transition-colors">All</button>
                                <button data-filter="General" className="filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 whitespace-nowrap transition-colors">General</button>
                                <button data-filter="Academic" className="filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 whitespace-nowrap transition-colors">Academic</button>
                                <button data-filter="Event" className="filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 whitespace-nowrap transition-colors">Events</button>
                                <button data-filter="Service" className="filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 whitespace-nowrap transition-colors">Service</button>
                            </div>

                            
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                                                <th className="px-4 py-3">Title</th>
                                                <th className="px-4 py-3">Category</th>
                                                <th className="px-4 py-3">Posted By</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm" id="announcementTableBody">
                                            <tr className="announcement-row border-b border-slate-100 hover:bg-slate-50 transition-colors" data-category="Academic">
                                                <td className="px-4 py-3 font-medium text-slate-800 announcement-title">Enrollment Schedule for 1st Semester, SY 2025-2026</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Academic</span></td>
                                                <td className="px-4 py-3 text-slate-600">Office of the Registrar</td>
                                                <td className="px-4 py-3 text-slate-500">Sep 5, 2025</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Published</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-slate-400 hover:text-ctu-lightblue mx-1 edit-btn"><i className="fa-solid fa-pen"></i></button>
                                                    <button className="text-slate-400 hover:text-red-500 mx-1 delete-btn"><i className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                            <tr className="announcement-row border-b border-slate-100 hover:bg-slate-50 transition-colors" data-category="General">
                                                <td className="px-4 py-3 font-medium text-slate-800 announcement-title">Suspension of classNamees (September 8, 2025)</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">General</span></td>
                                                <td className="px-4 py-3 text-slate-600">COTIFY Administration</td>
                                                <td className="px-4 py-3 text-slate-500">Sep 5, 2025</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Published</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-slate-400 hover:text-ctu-lightblue mx-1 edit-btn"><i className="fa-solid fa-pen"></i></button>
                                                    <button className="text-slate-400 hover:text-red-500 mx-1 delete-btn"><i className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                            <tr className="announcement-row border-b border-slate-100 hover:bg-slate-50 transition-colors" data-category="Event">
                                                <td className="px-4 py-3 font-medium text-slate-800 announcement-title">HIV/AIDS Awareness Seminar</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Event</span></td>
                                                <td className="px-4 py-3 text-slate-600">Student Affairs and Services</td>
                                                <td className="px-4 py-3 text-slate-500">Dec 3, 2023</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Published</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-slate-400 hover:text-ctu-lightblue mx-1 edit-btn"><i className="fa-solid fa-pen"></i></button>
                                                    <button className="text-slate-400 hover:text-red-500 mx-1 delete-btn"><i className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                            <tr className="announcement-row hover:bg-slate-50 transition-colors" data-category="Service">
                                                <td className="px-4 py-3 font-medium text-slate-800 announcement-title">Online Registration is Now Open</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700">Service</span></td>
                                                <td className="px-4 py-3 text-slate-600">Registrar's Office</td>
                                                <td className="px-4 py-3 text-slate-500">Aug 27, 2025</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">Published</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-slate-400 hover:text-ctu-lightblue mx-1 edit-btn"><i className="fa-solid fa-pen"></i></button>
                                                    <button className="text-slate-400 hover:text-red-500 mx-1 delete-btn"><i className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                
                                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                                    <span id="tableInfo">Showing 1-4 of 4 announcements</span>
                                    <div className="flex items-center gap-1">
                                        <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button className="w-6 h-6 flex items-center justify-center rounded bg-ctu-lightblue text-white font-medium">1</button>
                                        <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </main>
                </div>

                
                <div id="deleteModal" className="fixed inset-0 z-50 hidden items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                            <i className="fa-solid fa-trash text-red-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Announcement</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">Are you sure you want to delete this announcement? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button id="cancelDeleteBtn" className="flex-1 border border-slate-200 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                            <button id="confirmDeleteBtn" className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>

                
                <div id="newModal" className="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">New Announcement</h3>
                            <button id="closeNewModal" className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form id="newAnnouncementForm" className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                                <input type="text" id="newTitle" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Enter announcement title"></input>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                <select id="newCategory" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                                    <option value="General">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Event">Event</option>
                                    <option value="Service">Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Posted By</label>
                                <input type="text" id="newPostedBy" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="e.g. Office of the Registrar"></input>
                            </div>
                            <button type="submit" className="w-full bg-ctu-lightblue hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors">Publish Announcement</button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}