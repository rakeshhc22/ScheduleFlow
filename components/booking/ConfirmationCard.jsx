"use client";

import { CalendarCheck2, Clock3, Globe2 } from "lucide-react";

export default function ConfirmationCard({ booking, timezone }) {
    if (!booking) return null;

    const start = booking?.startTime ? new Date(booking.startTime) : null;

    return (
        <div className="rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(15,23,42,0.75))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-8">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                    <CalendarCheck2 className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
                        Booking confirmed
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                        Your meeting is scheduled
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                            <Clock3 className="h-4 w-4 text-emerald-300" />
                            {start
                                ? `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`
                                : "Time unavailable"}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                            <Globe2 className="h-4 w-4 text-emerald-300" />
                            {timezone || "Timezone not available"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
