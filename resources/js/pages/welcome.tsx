import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Trigger entrance animations after the component mounts
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head title="Welcome | Cotify" />
            
            {/* Custom Styles for Animations */}
            <style>{`
                @keyframes slowZoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slowZoom 20s ease-in-out infinite alternate;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-500 { animation-delay: 500ms; }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-900 antialiased overflow-x-hidden min-h-screen flex flex-col">
                
                {/* Background with slow zoom animation */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img 
                        src="/images/download.jpg" 
                        alt="Campus" 
                        className="w-full h-full object-cover opacity-30 animate-slow-zoom origin-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/60"></div>
                </div>

                {/* ==================== */}
                {/* HEADER               */}
                {/* ==================== */}
                <header 
                    className={`relative z-10 flex items-center justify-between px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full transition-all duration-1000 ease-out ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    {/* CHANGED: Removed gap and pushed them together with a negative right margin on the image */}
                    <div className="flex items-center text-white">
                        <img 
                            src="/images/3rdLogo.png" 
                            alt="Cotify Logo" 
                            className="w-32 h-32 sm:w-40 sm:h-40 object-contain -ml-8 -mr-10" 
                        />
                        <div>
                            <h1 className="font-bold text-4xl leading-tight tracking-wide">Cotify</h1>
                            <p className="text-lg text-slate-400">Your Campus Portal</p>
                        </div>
                    </div>

                    {/* Desktop Nav */}

                    <div className="flex items-center gap-4">
                        <Link 
                            href="/auth/register" 
                            className="hidden sm:block border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                        >
                            Register
                        </Link>
                        <Link 
                            href="/auth/login" 
                            className="hidden sm:block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            Login
                        </Link>
                        
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-white text-xl hover:text-blue-400 transition-colors"
                        >
                            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </header>

                {/* Mobile Menu */}
                <div 
                    className={`relative z-20 bg-slate-900/95 backdrop-blur-md lg:hidden border-b border-slate-800 overflow-hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-6 py-4 flex flex-col gap-4 text-slate-300 text-sm font-medium">
                        <a href="#" className="text-white">Home</a>
                        <div className="flex gap-3">
                            <Link href="/auth/register" className="flex-1 border border-blue-500 text-blue-400 text-center py-2 rounded-md hover:bg-blue-500 hover:text-white transition-colors">Register</Link>
                            <Link href="/auth/login" className="flex-1 bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600 transition-colors">Login</Link>
                        </div>
                    </div>
                </div>

                {/* ==================== */}
                {/* MAIN HERO SECTION    */}
                {/* ==================== */}
                <main className="relative z-10 flex-1 flex flex-col justify-center max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
                    <div className="max-w-3xl">
                        {/* Animated Subtitle */}
                        <p className={`text-blue-400 font-semibold tracking-widest text-xs uppercase mb-3 transition-all duration-700 ease-out delay-100 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}>
                            Cotify Platform
                        </p>
                        
                        {/* Animated Main Title */}
                        <h2 className={`text-4xl lg:text-7xl font-bold text-white leading-tight mb-6 transition-all duration-700 ease-out delay-200 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}>
                            Stay Informed,<br></br>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                Stay Connected
                            </span>
                        </h2>
                        
                        {/* Animated Paragraph */}
                        <p className={`text-slate-300 text-lg mb-10 max-w-xl transition-all duration-700 ease-out delay-300 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}>
                            Get the latest announcements, events, and important updates from Cotify — all in one place.
                        </p>
                        
                        {/* Animated Buttons */}
                        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-700 ease-out delay-400 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}>
                            <Link 
                                href="/auth/login" 
                                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 group"
                            >
                                View Announcements 
                                <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                            </Link>
                            <button className="w-full sm:w-auto bg-white/5 backdrop-blur-sm border border-slate-600 hover:border-white text-white px-6 py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10">
                                Learn More <i className="fa-solid fa-circle-info text-xs"></i>
                            </button>
                        </div>
                    </div>
                </main>

                {/* ==================== */}
                {/* FEATURE STRIP        */}
                {/* ==================== */}
                <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-16 pb-12">
                    <div 
                        className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 ease-out delay-500 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                        }`}
                    >
                        
                        {/* Feature 1 */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 mt-1 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                <i className="fa-solid fa-bullhorn text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-1">Latest Announcements</h4>
                                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">Be the first to know what's happening on campus.</p>
                            </div>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 mt-1 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                <i className="fa-regular fa-calendar text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-1">Upcoming Events</h4>
                                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">Seminars, activities, and important dates.</p>
                            </div>
                        </div>
                        
                        {/* Feature 3 */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 mt-1 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                <i className="fa-solid fa-graduation-cap text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-1">Academic Updates</h4>
                                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">Class suspensions, enrollment and more.</p>
                            </div>
                        </div>
                        
                        {/* Feature 4 */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 mt-1 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                <i className="fa-solid fa-users text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-semibold mb-1">Campus Life</h4>
                                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">Be part of a connected community.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}