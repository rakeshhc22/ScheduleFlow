"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardShell({ user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#07111f] text-white">
            <Sidebar
                user={user}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
