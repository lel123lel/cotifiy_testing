import { Form, Head, Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <>
            <Head title="Register | AnnounceHub" />
            

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

                        <h2 className="text-3xl font-bold mb-4">Join the Community!</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Create an account to stay updated with announcements, events, and important campus information.
                        </p>

                        <ul className="space-y-5 text-sm text-slate-300">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-check text-blue-400 text-xs"></i>
                                </div>
                                Access all announcements
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-check text-blue-400 text-xs"></i>
                                </div>
                                Register for events
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-check text-blue-400 text-xs"></i>
                                </div>
                                Connect with the campus
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                    
                    <Link 
                        href="/auth/login" 
                        className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm z-20" 
                        title="Back to Login"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>

                    <div 
                        className={`max-w-md w-full transition-all duration-1000 ease-out delay-150 ${
                            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    >
                        <div className="flex lg:hidden items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                                <i className="fa-solid fa-bullhorn text-white text-xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-900 leading-tight">AnnounceHub</h1>
                                <p className="text-xs text-slate-500">Your Campus Portal</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create an Account</h2>
                        <p className="text-sm text-slate-500 mb-8">Fill in the details below to get started</p>

                        <Form method="POST" action="/register" className="space-y-4">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-regular fa-user text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                placeholder="Enter your full name" 
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                                required
                                            />
                                            {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Student ID</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-regular fa-id-card text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                name="studentId"
                                                placeholder="Enter your student ID" 
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                                required
                                            />
                                            {errors.studentId && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.studentId}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-regular fa-envelope text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                placeholder="you@example.com" 
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                                required
                                            />
                                            {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-lock text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type={showPassword ? "text" : 'password'} 
                                                name="password" 
                                                placeholder="At least 6 characters" 
                                                className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                                required
                                            />
                                            <div 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            >
                                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-600 transition-colors`}></i>
                                            </div>
                                        </div>
                                        {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-lock text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                            </div>
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                name="password_confirmation" 
                                                placeholder="Re-enter your password" 
                                                className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                                required
                                            />
                                            <div 
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            >
                                                <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-600 transition-colors`}></i>
                                            </div>
                                        </div>
                                        {errors.password_confirmation && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password_confirmation}</p>}
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full block text-center bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-blue-500/40 mt-4"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i> Registering...
                                            </span>
                                        ) : 'Create Account'}
                                    </button>
                                </> 
                            )}
                        </Form>

                        <p className="text-center text-sm text-slate-500 mt-8">
                            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}