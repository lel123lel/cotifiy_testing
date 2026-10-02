import { Form, Head } from '@inertiajs/react'
import { useState } from 'react'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return (
        <>
            <Head title="Register"/>
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

                            <h2 className="text-3xl font-bold mb-4">Join the Community!</h2>
                            <p className="text-slate-300 mb-8">Create an account to stay updated with announcements, events, and important campus information.</p>

                            <ul className="space-y-4 text-sm text-slate-300">
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle w-5 text-center text-ctu-lightblue"></i> Access all announcements</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle w-5 text-center text-ctu-lightblue"></i> Register for events</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle w-5 text-center text-ctu-lightblue"></i> Connect with the campus</li>
                            </ul>
                        </div>
                    </div>

                    
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                        
                        
                        <a href="login.php" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-ctu-lightblue hover:border-ctu-lightblue hover:bg-blue-50 transition-all shadow-sm" title="Back to Login">
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

                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create an Account</h2>
                            <p className="text-sm text-slate-500 mb-8">Fill in the details below to get started</p>

                            <Form method="POST" action="/register" className="space-y-4">
                                {({ errors, processing }) => (
                                    <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-regular fa-user text-slate-400"></i>
                                        </div>
                                        <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="Enter your full name" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        required
                                        ></input>
                                        {errors.name && <p>{errors.name}</p>}
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Student ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-regular fa-user text-slate-400"></i>
                                        </div>
                                        <input 
                                        type="text" 
                                        name="studentId"
                                        placeholder="Enter your student ID" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        required
                                        ></input>
                                        {errors.studentId && <p>{errors.studentId}</p>}
                                    </div>
                                </div>

                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-regular fa-envelope text-slate-400"></i>
                                        </div>
                                        <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="you@example.com" 
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        ></input>
                                        {errors.email && <p>{errors.email}</p>}
                                    </div>
                                </div>

                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-solid fa-lock text-slate-400"></i>
                                        </div>
                                        <input 
                                        type={showPassword ? "text" : 'password'} 
                                        name="password" 
                                        placeholder="At least 6 characters" 
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        
                                        ></input>
                                        {errors.password && (
                                            <p className="text-sm text-red-600">{errors.password}</p>
                                        )}
                                        <div 
                                        id="togglePassword" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        >
                                            <i className="fa-regular fa-eye text-slate-400 hover:text-slate-600"></i>
                                        </div>
                                    </div>
                                </div>

                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-solid fa-lock text-slate-400"></i>
                                        </div>
                                        <input 
                                        type={showConfirmPassword ? "Text" : "password"} 
                                        name="password_confirmation" 
                                        placeholder="Re-enter your password" 
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        ></input>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-red-600">{errors.password_comfirmation}</p>
                                        )}
                                        <div 
                                        id="toggleConfirmPassword" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        >
                                            <i className="fa-regular fa-eye text-slate-400 hover:text-slate-600"></i>
                                        </div>
                                    </div>
                                </div>

                                            
                                <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full block text-center bg-ctu-lightblue hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors mt-2"
                                >
                                    {processing ? 'registering...' : 'Create Account'};
                                </button>
                                </> 
                            )}
                            </Form>

                            <p className="text-center text-xs text-slate-500 mt-8">
                                Already have an account? <a href="login.php" className="text-ctu-lightblue hover:underline font-medium">Log in</a>
                            </p>
                        </div>
                    </div>
    </div>
        </>
    );
}