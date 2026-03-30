"use client";

import { CalendarDays } from "lucide-react";

export default function CalendarPicker({ selectedDate, onChange, minDate }) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                    Select date
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                    Choose your day
                </h3>
            </div>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4">
                <CalendarDays className="h-4 w-4 text-sky-300" />
                <input
                    type="date"
                    value={selectedDate || ""}
                    min={minDate}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full bg-transparent text-sm text-white [color-scheme:dark] focus:outline-none"
                />
            </div>
        </div>
    );
}
