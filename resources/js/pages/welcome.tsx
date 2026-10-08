import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
                <div className="font-sans text-slate-800 bg-ctu-dark antialiased overflow-x-hidden min-h-screen flex flex-col">
                
                    <div className="absolute inset-0 z-0">
                        <img src="/images/download.jpg" alt="University Campus" className="w-full h-full object-cover opacity-30"></img>
                        <div className="absolute inset-0 bg-gradient-to-r from-ctu-dark via-ctu-dark/90 to-ctu-dark/60"></div>
                    </div>

                    
                    <header className="relative z-10 flex items-center justify-between px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight tracking-wide">COTIFY</h1>
                                <p className="text-xs text-slate-300">College of Technology</p>
                            </div>
                        </div>

                        
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
                            <a href="#" className="text-white border-b-2 border-ctu-lightblue pb-1">Home</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button id="themeToggle" className="text-slate-300 hover:text-white transition-colors"><i className="fa-solid fa-sun"></i></button>
                            <a href="/auth/login" className="hidden sm:block bg-ctu-lightblue hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors">Login</a>
                            
                            
                            <button id="mobileMenuBtn" className="lg:hidden text-white text-xl">
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        </div>
                    </header>

                    
                    <div id="mobileMenu" className="hidden relative z-20 bg-ctu-dark/95 backdrop-blur-md lg:hidden border-b border-slate-700">
                        <div className="px-6 py-4 flex flex-col gap-4 text-slate-300 text-sm font-medium">
                            <a href="#" className="text-white">Home</a>
                            <a href="login.php" className="bg-ctu-lightblue text-white text-center py-2 rounded-md mt-2">Login</a>
                        </div>
                    </div>

                    
                    <main className="relative z-10 flex-1 flex flex-col justify-center max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
                        <div className="max-w-3xl">
                            <p className="text-ctu-lightblue font-semibold tracking-widest text-xs uppercase mb-3">College of Technology</p>
                            <h2 className="text-4xl lg:text-7xl font-bold text-white leading-tight mb-6">
                                Stay Informed,<br></br>
                                <span className="text-blue-400">Stay Connected</span>
                            </h2>
                            <p className="text-slate-300 text-lg mb-10 max-w-xl">
                                Get the latest announcements, events, and important updates from COTIFY — all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <a href="login.html" className="w-full sm:w-auto bg-ctu-lightblue hover:bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    View Announcements <i className="fa-solid fa-arrow-right text-xs"></i>
                                </a>
                                <button className="w-full sm:w-auto bg-transparent border border-slate-500 hover:border-white text-white px-6 py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    Learn More <i className="fa-solid fa-circle-info text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </main>

                    
                    <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-16 pb-12">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                                    <i className="fa-solid fa-bullhorn text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-1">Latest Announcements</h4>
                                    <p className="text-slate-300 text-xs">Be the first to know what's happening on campus.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                                    <i className="fa-regular fa-calendar text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-1">Upcoming Events</h4>
                                    <p className="text-slate-300 text-xs">Seminars, activities, and important dates.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                                    <i className="fa-solid fa-graduation-cap text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-1">Academic Updates</h4>
                                    <p className="text-slate-300 text-xs">className suspensions, enrollment and more.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1">
                                    <i className="fa-solid fa-users text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-1">Campus Life</h4>
                                    <p className="text-slate-300 text-xs">Be part of a connected CTU community.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </>
    );
}
