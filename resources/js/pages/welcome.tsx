import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <a href="/login" className="text-blue-500 hover:underline rounded-md px-2 py-1 text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                Go to Login
            </a>
            <a href="/register" className="text-blue-500 hover:underline rounded-md px-2 py-1 text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                Go to Register
            </a>
        </>
    );
}
