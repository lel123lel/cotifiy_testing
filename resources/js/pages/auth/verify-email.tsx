import { Head } from '@inertiajs/react';

type VerifyEmailProps = {
    email?: string;
    status?: string;
    verified?: boolean;
};

export default function VerifyEmail({
    email,
    status,
    verified = false,
}: VerifyEmailProps) {
    return (
        <>
            <Head title={verified ? 'Email Verified' : 'Verify Email'} />

            <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
                <div className="bg-ctu-dark relative hidden w-1/2 flex-col justify-center overflow-hidden px-16 text-white lg:flex">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="download.jpg"
                            alt="University Campus"
                            className="h-full w-full object-cover opacity-20"
                        />
                        <div className="from-ctu-dark via-ctu-dark/80 absolute inset-0 bg-gradient-to-t to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-md">
                        <div className="mb-12 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1">
                                <i className="fa-solid fa-gear text-ctu-dark text-2xl"></i>
                            </div>

                            <div>
                                <h1 className="text-2xl leading-tight font-bold tracking-wide">
                                    COTIFY
                                </h1>
                                <p className="text-sm text-slate-300">
                                    College of Technology
                                </p>
                            </div>
                        </div>

                        <h2 className="mb-4 text-3xl font-bold">
                            Check Your Email
                        </h2>

                        <p className="mb-8 text-slate-300">
                            We'll send a secure verification link to your email
                            address. Open the link to verify your account and
                            complete your registration.
                        </p>

                        <ul className="space-y-4 text-sm text-slate-300">
                            <li className="flex items-center gap-3">
                                <i className="fa-regular fa-envelope text-ctu-lightblue w-5 text-center"></i>
                                Link sent to your inbox
                            </li>

                            <li className="flex items-center gap-3">
                                <i className="fa-solid fa-shield-halved text-ctu-lightblue w-5 text-center"></i>
                                Secure verification process
                            </li>

                            <li className="flex items-center gap-3">
                                <i className="fa-solid fa-clock text-ctu-lightblue w-5 text-center"></i>
                                Link expires after a limited time
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="relative flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
                    <a
                        href="/auth/login"
                        className="hover:text-ctu-lightblue hover:border-ctu-lightblue absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-blue-50 sm:top-8 sm:left-8"
                        title="Back to Login"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </a>

                    <div className="w-full max-w-md">
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
                                <i className="fa-solid fa-gear text-ctu-dark text-xl"></i>
                            </div>

                            <div>
                                <h1 className="leading-tight font-bold text-slate-800">
                                    COTIFY
                                </h1>
                                <p className="text-xs text-slate-500">
                                    College of Technology
                                </p>
                            </div>
                        </div>

                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <i className="fa-regular fa-envelope text-ctu-lightblue text-2xl"></i>
                            </div>
                        </div>

                        <h2 className="mb-2 text-center text-2xl font-bold text-slate-800">
                            {verified ? 'Email Verified' : 'Verify Your Email'}
                        </h2>

                        {verified ? (
                            <>
                                <p className="mb-8 text-center text-sm text-slate-500">
                                    Your email address has been verified and
                                    your account has been created.
                                </p>

                                <a
                                    href="/auth/login"
                                    className="block w-full rounded-lg bg-blue-500 py-3 text-center font-medium text-white transition-colors hover:bg-blue-600"
                                >
                                    Continue
                                </a>
                            </>
                        ) : (
                            <>
                                <p className="mb-2 text-center text-sm text-slate-500">
                                    We sent a verification link to
                                </p>

                                {email && (
                                    <p className="mb-8 text-center text-sm font-semibold text-slate-700">
                                        {email}
                                    </p>
                                )}

                                {status === 'verification-link-sent' && (
                                    <div
                                        role="status"
                                        className="mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                                    >
                                        <i className="fa-solid fa-circle-check mt-0.5"></i>
                                        <span>
                                            A new verification link has been sent to
                                            your email.
                                        </span>
                                    </div>
                                )}

                                <p className="mb-6 text-center text-sm text-slate-500">
                                    Use the link in the email to verify your address. If
                                    it isn't in your inbox, check your spam folder. If
                                    the link expires, register again to request a new one.
                                </p>
                            </>
                        )}

                        <p className="mt-8 text-center text-xs text-slate-500">
                            Wrong email?
                            <a
                                href="/auth/register"
                                className="font-medium text-blue-500 hover:underline"
                            >
                                Go back to sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
