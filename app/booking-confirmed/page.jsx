"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    CalendarCheck2,
    Clock3,
    Globe2,
    User2,
    Mail,
    Home,
} from "lucide-react";

// ── Inner component — uses useSearchParams ───────────────
// Must be wrapped in <Suspense> to avoid Next.js build error
function ConfirmationContent() {
    const searchParams = useSearchParams();

    // Fix: read the params that BookingForm actually sends
    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";
    const timezone = searchParams.get("timezone") || "UTC";
    const event = searchParams.get("event") || "Meeting";

    // Format the date and time from ISO strings
    const formattedDate = start
        ? new Date(start).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: timezone,
        })
        : "—";

    const formattedStart = start
        ? new Date(start).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
        })
        : "—";

    const formattedEnd = end
        ? new Date(end).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
        })
        : "—";

    return (
        <div className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
            <div className="mx-auto max-w-xl">
                <section className="rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(15,23,42,0.75))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-8">

                    {/* ── Header ── */}
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                            <CalendarCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
                                Booking confirmed
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                                Your meeting is scheduled
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                A confirmation email has been sent. Please save the details below
                                for your reference.
                            </p>
                        </div>
                    </div>

                    {/* ── Event title ── */}
                    <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-emerald-300/70">
                            Event
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">{event}</p>
                    </div>

                    {/* ── Booking details ── */}
                    <div className="mt-4 space-y-3">

                        {/* Guest name */}
                        {name && (
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                                <User2 className="h-4 w-4 shrink-0 text-sky-300" />
                                <div>
                                    <p className="text-xs text-slate-500">Guest</p>
                                    <p className="text-white">{name}</p>
                                </div>
                            </div>
                        )}

                        {/* Guest email */}
                        {email && (
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                                <Mail className="h-4 w-4 shrink-0 text-sky-300" />
                                <div>
                                    <p className="text-xs text-slate-500">Confirmation sent to</p>
                                    <p className="text-white">{email}</p>
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            <CalendarCheck2 className="h-4 w-4 shrink-0 text-sky-300" />
                            <div>
                                <p className="text-xs text-slate-500">Date</p>
                                <p className="text-white">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            <Clock3 className="h-4 w-4 shrink-0 text-sky-300" />
                            <div>
                                <p className="text-xs text-slate-500">Time</p>
                                <p className="text-white">
                                    {formattedStart} – {formattedEnd}
                                </p>
                            </div>
                        </div>

                        {/* Timezone */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            <Globe2 className="h-4 w-4 shrink-0 text-sky-300" />
                            <div>
                                <p className="text-xs text-slate-500">Timezone</p>
                                <p className="text-white">{timezone}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Action ── */}
                    <Link
                        href="/"
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30"
                    >
                        <Home className="h-4 w-4" />
                        Back to home
                    </Link>
                </section>
            </div>
        </div>
    );
}

// ── Page export — Suspense required for useSearchParams ──
export default function BookingConfirmedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#07111f]">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                </div>
            }
        >
            <ConfirmationContent />
        </Suspense>
    );
}