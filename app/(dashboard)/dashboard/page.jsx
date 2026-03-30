"use client";

import { useEffect, useMemo, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";
import {
    CalendarDays,
    Clock3,
    ArrowRight,
    Activity,
    UserRound,
    Sparkles,
} from "lucide-react";

export default function DashboardPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadBookings() {
            try {
                const res = await fetch("/api/bookings");
                const data = await res.json();
                if (active) {
                    setBookings(Array.isArray(data.bookings) ? data.bookings : []);
                }
            } catch (error) {
                if (active) setBookings([]);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadBookings();
        return () => {
            active = false;
        };
    }, []);

    const now = new Date();

    const sortedBookings = useMemo(() => {
        return [...bookings].sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
    }, [bookings]);

    const upcoming = useMemo(
        () => sortedBookings.filter((b) => new Date(b.startTime) > now),
        [sortedBookings]
    );

    const past = useMemo(
        () => sortedBookings.filter((b) => new Date(b.startTime) <= now),
        [sortedBookings]
    );

    const todayBookings = useMemo(() => {
        return sortedBookings.filter((b) => {
            const date = new Date(b.startTime);
            return date.toDateString() === now.toDateString();
        });
    }, [sortedBookings]);

    const nextMeeting = upcoming[0];

    return (
        <div className="min-h-screen bg-[#07111f] text-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
                <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(4,10,22,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.45)] md:p-8">
                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Scheduling overview
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                                Your booking command center
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                                Track meetings, monitor today’s schedule, and stay ahead of
                                upcoming sessions from one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/event-types/new"
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30"
                            >
                                Create event
                            </Link>

                            <Link
                                href="/bookings"
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:bg-white/10"
                            >
                                View all bookings
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatsCard
                        title="Total bookings"
                        value={loading ? "—" : bookings.length}
                        icon={<CalendarDays className="h-5 w-5" />}
                        tone="sky"
                        helper="All scheduled sessions"
                    />
                    <StatsCard
                        title="Upcoming"
                        value={loading ? "—" : upcoming.length}
                        icon={<Clock3 className="h-5 w-5" />}
                        tone="violet"
                        helper="Future confirmed meetings"
                    />
                    <StatsCard
                        title="Today"
                        value={loading ? "—" : todayBookings.length}
                        icon={<Activity className="h-5 w-5" />}
                        tone="emerald"
                        helper="Meetings on your calendar today"
                    />
                    <StatsCard
                        title="Past"
                        value={loading ? "—" : past.length}
                        icon={<UserRound className="h-5 w-5" />}
                        tone="slate"
                        helper="Completed or expired sessions"
                    />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-6">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Today’s schedule
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Your meetings lined up for today
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-20 animate-pulse rounded-2xl bg-white/5"
                                        />
                                    ))}
                                </div>
                            ) : todayBookings.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                                    <p className="text-base font-medium text-white">
                                        No meetings scheduled for today
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Enjoy the space, or create a new event type to keep bookings
                                        flowing.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayBookings.map((b, i) => {
                                        const start = new Date(b.startTime);
                                        const isPast = start <= now;

                                        return (
                                            <div
                                                key={i}
                                                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05] md:flex-row md:items-center md:justify-between"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 h-10 w-10 rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20 flex items-center justify-center">
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {b.guestName || "Guest"}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {start.toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${isPast
                                                        ? "bg-slate-500/15 text-slate-300 ring-1 ring-white/10"
                                                        : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                                                        }`}
                                                >
                                                    {isPast ? "Completed" : "Upcoming"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Upcoming meetings
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Your next confirmed bookings
                                    </p>
                                </div>

                                <Link
                                    href="/bookings"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-sky-200"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-16 animate-pulse rounded-2xl bg-white/5"
                                        />
                                    ))}
                                </div>
                            ) : upcoming.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                                    <p className="text-base font-medium text-white">
                                        No upcoming bookings
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Share your event link to start receiving meetings.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming.slice(0, 5).map((b, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {b.guestName || "Guest"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {new Date(b.startTime).toLocaleDateString()} ·{" "}
                                                    {new Date(b.startTime).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/20">
                                                Confirmed
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-[24px] border border-sky-400/15 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),rgba(99,102,241,0.08))] p-6 shadow-[0_10px_40px_rgba(2,6,23,0.22)] backdrop-blur-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
                                Next up
                            </p>

                            {loading ? (
                                <div className="mt-4 h-28 animate-pulse rounded-2xl bg-white/10" />
                            ) : nextMeeting ? (
                                <>
                                    <h3 className="mt-4 text-xl font-semibold text-white">
                                        {nextMeeting.guestName || "Guest"}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {new Date(nextMeeting.startTime).toLocaleDateString()} at{" "}
                                        {new Date(nextMeeting.startTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>

                                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                        <p className="text-xs text-slate-400">Stay prepared</p>
                                        <p className="mt-1 text-sm text-white">
                                            Review availability, notes, and linked calendar events
                                            before the meeting starts.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-6">
                                    <p className="text-sm font-medium text-white">
                                        Nothing scheduled next
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Once a new booking arrives, it will appear here.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                            <h3 className="text-base font-semibold text-white">
                                Quick actions
                            </h3>

                            <div className="mt-4 space-y-3">
                                <Link
                                    href="/event-types/new"
                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                                >
                                    <span>Create new event type</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/availability"
                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                                >
                                    <span>Manage availability</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/settings"
                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                                >
                                    <span>Update scheduling settings</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}