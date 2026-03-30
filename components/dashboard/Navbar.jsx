"use client";

// components/dashboard/Navbar.jsx
// Top navigation bar — dynamic page title, notification bell,
// public profile shortcut, and user dropdown menu.

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Bell, LogOut, User, ExternalLink, ChevronDown } from "lucide-react";

const PAGE_META = {
    "/dashboard": {
        title: "Dashboard",
        subtitle: "Here's what's happening today",
    },
    "/event-types": {
        title: "Event Types",
        subtitle: "Manage your meeting templates",
    },
    "/event-types/new": {
        title: "New Event Type",
        subtitle: "Create a new meeting type",
    },
    "/availability": {
        title: "Availability",
        subtitle: "Set your weekly schedule",
    },
    "/bookings": {
        title: "Bookings",
        subtitle: "View and manage your appointments",
    },
    "/settings": {
        title: "Settings",
        subtitle: "Manage your account preferences",
    },
};

function getPageMeta(pathname) {
    if (PAGE_META[pathname]) return PAGE_META[pathname];

    for (const [key, val] of Object.entries(PAGE_META)) {
        if (key !== "/dashboard" && pathname.startsWith(key)) return val;
    }

    return { title: "", subtitle: "" };
}

function getInitials(name = "") {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function Navbar({ user }) {
    const pathname = usePathname();
    const { title, subtitle } = getPageMeta(pathname);

    return (
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#07111f]/80 px-4 backdrop-blur-xl md:px-6">
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-300/70">

                </p>
                <h1 className="truncate text-[17px] font-semibold tracking-tight text-white">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {user?.username && (
                    <Link
                        href={`/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:flex"
                    >
                        <ExternalLink size={13} />
                        <span>/{user.username}</span>
                    </Link>
                )}

                <button
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    aria-label="Notifications"
                >
                    <Bell size={16} />
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#07111f]" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] pl-1.5 pr-2 py-1.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.08] focus:outline-none">
                            <Avatar className="h-8 w-8 ring-1 ring-white/10">
                                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500/80 to-indigo-500/80 text-[11px] font-semibold text-white">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>

                            <span className="hidden max-w-[110px] truncate text-[13px] font-medium text-slate-200 sm:block">
                                {user?.name}
                            </span>

                            <ChevronDown size={13} className="hidden text-slate-500 sm:block" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56 rounded-2xl border border-white/10 bg-[#0d1728]/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="pb-2 pt-1">
                            <p className="truncate text-[13px] font-medium text-white">
                                {user?.name}
                            </p>
                            <p className="mt-1 truncate text-[11px] font-normal text-slate-400">
                                {user?.email}
                            </p>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem asChild>
                            <Link
                                href="/settings"
                                className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] text-slate-300 outline-none transition hover:text-white focus:text-white"
                            >
                                <User size={14} />
                                Profile &amp; Settings
                            </Link>
                        </DropdownMenuItem>

                        {user?.username && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/${user.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] text-slate-300 outline-none transition hover:text-white focus:text-white"
                                >
                                    <ExternalLink size={14} />
                                    View Public Page
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] text-rose-400 outline-none transition hover:bg-rose-500/10 hover:text-rose-300 focus:bg-rose-500/10 focus:text-rose-300"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
