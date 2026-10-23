import { Form, Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Trigger entrance animations
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head title="Login | AnnounceHub" />
            
            {/* Custom Styles for the Background Animation */}
            <style>{`
                @keyframes slowZoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slowZoom 20s ease-in-out infinite alternate;
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex">
                
                {/* ========================================= */}
                {/* LEFT SIDE: Info Panel with Animation      */}
                {/* ========================================= */}
                <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-center px-16 relative overflow-hidden">
                    
                    {/* Animated Background Image */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img 
                            src="/images/download.jpg" 
                            alt="Campus" 
                            className="w-full h-full object-cover opacity-20 animate-slow-zoom origin-center" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>

                    {/* Animated Content */}
                    <div 
                        className={`relative z-10 max-w-md transition-all duration-1000 ease-out ${
                            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                        }`}
                    >
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow-lg shadow-blue-500/20">
                                <i className="fa-solid fa-bullhorn text-slate-900 text-2xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl leading-tight tracking-wide">Cotify</h1>
                                <p className="text-sm text-slate-400">Your Campus Portal</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Log in to your account to access announcements, manage events, and stay connected with the community.
                        </p>

                        <ul className="space-y-5 text-sm text-slate-300">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-regular fa-bell text-blue-400"></i>
                                </div>
                                View latest announcements
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-regular fa-calendar text-blue-400"></i>
                                </div>
                                Manage upcoming events
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-chart-pie text-blue-400"></i>
                                </div>
                                Access your dashboard
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ========================================= */}
                {/* RIGHT SIDE: Login Form                    */}
                {/* ========================================= */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                    
                    {/* Back Button */}
                    <Link 
                        href="/" 
                        className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm z-20" 
                        title="Back to Home"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>

                    {/* Form Container with slide-up animation */}
                    <div 
                        className={`max-w-md w-full transition-all duration-1000 ease-out delay-150 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    >
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                                <i className="fa-solid fa-bullhorn text-white text-xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-900 leading-tight">AnnounceHub</h1>
                                <p className="text-xs text-slate-500">Your Campus Portal</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login</h2>
                        <p className="text-sm text-slate-500 mb-8">Enter your credentials to continue</p>

                        <Form method="post" action="/auth/login" className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                                    {/* Email Field */}
                                    <div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-regular fa-envelope text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                autoComplete="username" 
                                                required 
                                                placeholder="Email address" 
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-lock text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                name="password" 
                                                autoComplete="current-password" 
                                                required 
                                                placeholder="Password" 
                                                className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-600 transition-colors`}></i>
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                                    </div>

                                    {/* Options */}
                                    <div className="flex items-center justify-between text-sm pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                name="remember" 
                                                value="1" 
                                                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                                        </label>
                                        <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">Forgot password?</a>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="w-full block text-center bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-blue-500/40"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i> Logging in...
                                            </span>
                                        ) : 'Log In'}
                                    </button>
                                </>
                            )}
                        </Form>

                        <p className="text-center text-sm text-slate-500 mt-10">
                            Don't have an account? <a href="/auth/register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">Sign up here.</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}