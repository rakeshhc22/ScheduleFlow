"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
    LayoutDashboard,
    CalendarRange,
    Clock3,
    BookOpenCheck,
    Settings,
    Sparkles,
    Plus,
    X,
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Event Types",
        href: "/event-types",
        icon: CalendarRange,
    },
    {
        label: "Availability",
        href: "/availability",
        icon: Clock3,
    },
    {
        label: "Bookings",
        href: "/bookings",
        icon: BookOpenCheck,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export default function Sidebar({ open = false, onClose }) {
    const pathname = usePathname();

    const currentItem = useMemo(() => {
        return navItems.find((item) =>
            item.exact ? pathname === item.href : pathname?.startsWith(item.href)
        );
    }, [pathname]);

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={onClose}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#07111f]/95 px-4 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-0 lg:w-[280px] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between px-2 pb-4 pt-1 lg:pb-6">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20">
                            <Sparkles className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-base font-semibold tracking-tight text-white">
                                ScheduleFlow
                            </p>
                            <p className="text-xs text-slate-400">Smart scheduling workspace</p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                        Workspace
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                        {currentItem?.label || "Overview"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                        Navigate your meetings, availability, and event setup from one place.
                    </p>

                    <Link
                        href="/event-types/new"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30"
                    >
                        <Plus className="h-4 w-4" />
                        Create event
                    </Link>
                </div> */}

                <nav className="mt-6 flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname?.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-medium transition ${isActive
                                    ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20"
                                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                                    }`}
                            >
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive
                                        ? "bg-sky-400/10 text-sky-300"
                                        : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-white"
                                        }`}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </span>

                                <span className="flex-1">{item.label}</span>

                                {isActive ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>

                {/* <div className="mt-6 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,165,233,0.10),rgba(99,102,241,0.08))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                        Pro tip
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-white">
                        Keep your availability updated
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Accurate working hours help avoid clashes and improve booking quality.
                    </p>

                    <Link
                        href="/availability"
                        className="mt-4 inline-flex text-sm font-medium text-sky-300 transition hover:text-sky-200"
                    >
                        Update availability
                    </Link>
                </div> */}
            </aside>
        </>
    );
}
