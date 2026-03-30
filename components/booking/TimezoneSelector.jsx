"use client";

import { Globe2 } from "lucide-react";

export default function TimezoneSelector({
    value,
    onChange,
    timezones = [],
}) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                    Timezone
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                    View in your local time
                </h3>
            </div>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4">
                <Globe2 className="h-4 w-4 text-sky-300" />
                <select
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                >
                    {timezones.map((tz) => (
                        <option key={tz} value={tz} className="bg-[#0b1220] text-white">
                            {tz}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
