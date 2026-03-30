"use client";

import { Clock3 } from "lucide-react";

export default function TimeSlotList({
    slots = [],
    selectedSlot,
    onSelect,
    loading = false,
}) {
    if (loading) {
        return (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-11 animate-pulse rounded-xl bg-white/[0.05]"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                    Available slots
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                    Pick a time
                </h3>
            </div>

            {slots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
                    <p className="text-sm font-medium text-white">No slots available</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Try selecting another date or timezone.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {slots.map((slot, index) => {
                        const isSelected =
                            selectedSlot?.start === slot.start ||
                            selectedSlot?.startTime === slot.startTime;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onSelect?.(slot)}
                                className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition ${isSelected
                                        ? "border-sky-400/30 bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20"
                                        : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
                                    }`}
                            >
                                <Clock3 className="h-4 w-4" />
                                {slot.startTime || slot}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
