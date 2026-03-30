// app/(auth)/layout.jsx
// Shared layout for login and register pages

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center p-4">
            {/* Brand mark top-left on larger screens */}
            <div className="absolute top-6 left-8 hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">ScheduleFlow</span>
            </div>

            {/* Auth card */}
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}