import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Login" />
            <div className="font-sans text-slate-800 bg-slate-50 antialiased min-h-screen flex">
                <div className="hidden lg:flex w-1/2 bg-ctu-dark text-white flex-col justify-center px-16 relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src="/images/download.jpg" alt="University Campus" className="w-full h-full object-cover opacity-20"></img>
                        <div className="absolute inset-0 bg-gradient-to-t from-ctu-dark via-ctu-dark/80 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-md">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-2xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl leading-tight tracking-wide">COTIFY</h1>
                                <p className="text-sm text-slate-300">College of Technology</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                        <p className="text-slate-300 mb-8">Log in to your account to access announcements and manage the system.</p>

                        <ul className="space-y-4 text-sm text-slate-300">
                            <li className="flex items-center gap-3"><i className="fa-regular fa-bell w-5 text-center text-ctu-lightblue"></i> View latest announcements</li>
                            <li className="flex items-center gap-3"><i className="fa-regular fa-calendar w-5 text-center text-ctu-lightblue"></i> Manage events</li>
                            <li className="flex items-center gap-3"><i className="fa-solid fa-chart-pie w-5 text-center text-ctu-lightblue"></i> Access your dashboard</li>
                        </ul>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                    <a href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:border-ctu-lightblue hover:bg-blue-50 transition-all shadow-sm" title="Back to Home">
                        <i className="fa-solid fa-arrow-left"></i>
                    </a>

                    <div className="max-w-md w-full">
                        <div className="flex lg:hidden items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <i className="fa-solid fa-gear text-ctu-dark text-xl"></i>
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-800 leading-tight">COTIFY</h1>
                                <p className="text-xs text-slate-500">College of Technology</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Login</h2>
                        <p className="text-sm text-slate-500 mb-8">Enter your credentials to continue</p>

                        <Form method="post" action="/auth/login" className="space-y-5">
                            {({ errors, processing }) => (
                                <>
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-regular fa-envelope text-slate-400"></i>
                                            </div>
                                            <input type="email" name="email" autoComplete="username" required placeholder="Email address" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"></input>
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-lock text-slate-400"></i>
                                            </div>
                                            <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required placeholder="Password" className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"></input>
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-600`}></i>
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="remember" value="1" className="rounded border-slate-300 text-ctu-lightblue focus:ring-ctu-lightblue"></input>
                                            <span className="text-slate-600">Remember me</span>
                                        </label>
                                        <a href="#" className="text-ctu-lightblue hover:underline font-medium">Forgot password?</a>
                                    </div>

                                    <button type="submit" disabled={processing} className="w-full block text-center bg-ctu-lightblue hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors">
                                        {processing ? 'Logging in...' : 'Log In'}
                                    </button>
                                </>
                            )}
                        </Form>

                        <p className="text-center text-xs text-slate-500 mt-8">
                            Don't have an account? <a href="#" className="text-ctu-lightblue hover:underline font-medium">Contact your administrator.</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
