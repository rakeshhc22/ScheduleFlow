"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, ArrowLeft } from "lucide-react";

export default function BookingConfirmPage() {
    const searchParams = useSearchParams();

    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const timezone = searchParams.get("timezone");
    const title = searchParams.get("title");

    return (
        <div className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
            <div className="mx-auto max-w-3xl space-y-6">
                <Link
                    href=".."
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>

                <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(15,23,42,0.75))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                            <CalendarCheck2 className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
                                Review booking
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                                Confirm your selected slot
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Make sure the event details below are correct before continuing.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            Event: {title || "Selected event"}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            Date: {date || "Not selected"}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            Time: {time || "Not selected"}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200">
                            Timezone: {timezone || "Not selected"}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
