"use client";

// app/(dashboard)/availability/page.jsx
// Calendly-style weekly availability grid.
// - Days shown as columns (Mon–Sun)
// - Time ruler on the left (08:00 – 20:00)
// - Active hours highlighted as a draggable-looking block per column
// - Click a day column header to toggle it on/off
// - Selected day's start/end time editable in the bottom panel
// - All API logic unchanged from original

import { useEffect, useState } from "react";
import { Loader2, Save, Globe, Clock, CheckCircle2, XCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
    { key: "monday", short: "MON", label: "Monday" },
    { key: "tuesday", short: "TUE", label: "Tuesday" },
    { key: "wednesday", short: "WED", label: "Wednesday" },
    { key: "thursday", short: "THU", label: "Thursday" },
    { key: "friday", short: "FRI", label: "Friday" },
    { key: "saturday", short: "SAT", label: "Saturday" },
    { key: "sunday", short: "SUN", label: "Sunday" },
];

const DEFAULT_WEEKLY_AVAILABILITY = [
    { day: "monday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "tuesday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "wednesday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "thursday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "friday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "saturday", isActive: false, startTime: "09:00", endTime: "17:00" },
    { day: "sunday", isActive: false, startTime: "09:00", endTime: "17:00" },
];

// Grid time range: 08:00 – 20:00
const GRID_START = 8;   // hour
const GRID_END = 20;  // hour
const TOTAL_HOURS = GRID_END - GRID_START; // 12

// Hour labels shown on the left ruler
const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = GRID_START + i;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hour: h, label: `${h12}:00 ${ampm}` };
});

// Height of each hour row in px
const ROW_H = 52;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeWeeklyAvailability(incoming = []) {
    const map = new Map(
        Array.isArray(incoming) ? incoming.map((item) => [item.day, item]) : []
    );
    return DEFAULT_WEEKLY_AVAILABILITY.map((d) => ({
        ...d,
        ...(map.get(d.day) || {}),
    }));
}

// Convert "HH:MM" → fractional hour offset from GRID_START
function timeToOffset(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60 - GRID_START;
}

// Convert fractional offset → pixel top position inside the grid column
function offsetToPx(offset) {
    return Math.max(0, offset * ROW_H);
}

// Height in px for a time range
function rangeToPx(startTime, endTime) {
    const start = timeToOffset(startTime);
    const end = timeToOffset(endTime);
    return Math.max(ROW_H / 2, (end - start) * ROW_H);
}

// Generate time options for select (every 30 min, 08:00–20:00)
function genTimeOptions() {
    const opts = [];
    for (let h = GRID_START; h <= GRID_END; h++) {
        ["00", "30"].forEach((m) => {
            if (h === GRID_END && m === "30") return;
            const val = `${String(h).padStart(2, "0")}:${m}`;
            const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
            const ampm = h >= 12 ? "PM" : "AM";
            const label = `${hour12}:${m} ${ampm}`;
            opts.push({ val, label });
        });
    }
    return opts;
}
const TIME_OPTIONS = genTimeOptions();

// ─── Common IANA timezones ────────────────────────────────────────────────────
const TIMEZONES = [
    "Asia/Kolkata", "UTC", "America/New_York", "America/Chicago",
    "America/Denver", "America/Los_Angeles", "Europe/London",
    "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore",
    "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function AvailabilityPage() {
    const [weeklyAvailability, setWeeklyAvailability] = useState(DEFAULT_WEEKLY_AVAILABILITY);
    const [timezone, setTimezone] = useState("Asia/Kolkata");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", ok: true });
    const [activeDay, setActiveDay] = useState("monday"); // which day's panel is open

    // ── Fetch on mount ──────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch("/api/availability");
                const data = await res.json();
                if (data?.availability) {
                    setWeeklyAvailability(
                        normalizeWeeklyAvailability(data.availability.weeklyAvailability)
                    );
                    setTimezone(data.availability.timezone || "Asia/Kolkata");
                }
            } catch (err) {
                console.error("[AVAILABILITY_FETCH]", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, []);

    // ── Update a single day field ───────────────────────────────────────────
    const updateDay = (dayKey, field, value) => {
        setWeeklyAvailability((prev) =>
            prev.map((d) => (d.day === dayKey ? { ...d, [field]: value } : d))
        );
    };

    const toggleDay = (dayKey) => {
        setWeeklyAvailability((prev) =>
            prev.map((d) => (d.day === dayKey ? { ...d, isActive: !d.isActive } : d))
        );
    };

    // ── Save ────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: "", ok: true });
        try {
            const res = await fetch("/api/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timezone, weeklyAvailability }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message || "Saved successfully", ok: true });
                setWeeklyAvailability(
                    normalizeWeeklyAvailability(data.availability?.weeklyAvailability)
                );
            } else {
                setMessage({ text: data.error || "Failed to save", ok: false });
            }
        } catch {
            setMessage({ text: "Something went wrong", ok: false });
        } finally {
            setSaving(false);
        }
    };

    // ── Active day data ─────────────────────────────────────────────────────
    const activeDayData = weeklyAvailability.find((d) => d.day === activeDay)
        || DEFAULT_WEEKLY_AVAILABILITY.find((d) => d.day === activeDay);

    // ── Loading skeleton ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-28 rounded-[28px] border border-white/10 bg-white/[0.04]" />
                <div className="h-[480px] rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                            Availability
                        </p>
                        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                            Weekly schedule
                        </h1>
                        <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            Click a day column to edit its hours. Toggle to enable or disable booking.
                        </p>
                    </div>

                    {/* Timezone selector */}
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 shrink-0">
                        <Globe className="h-4 w-4 text-sky-300 shrink-0" />
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz} className="bg-[#0f1729] text-white">
                                    {tz}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* ── Weekly grid ─────────────────────────────────────────────── */}
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl overflow-hidden">

                {/* Day column headers */}
                <div className="grid border-b border-white/10"
                    style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}>

                    {/* Empty corner above ruler */}
                    <div className="border-r border-white/10" />

                    {DAYS.map(({ key, short, label }) => {
                        const day = weeklyAvailability.find((d) => d.day === key);
                        const isActive = day?.isActive ?? false;
                        const isSelected = activeDay === key;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveDay(key)}
                                className={`group flex flex-col items-center gap-1.5 border-r border-white/10
                                    py-3 px-1 transition-colors last:border-r-0
                                    ${isSelected
                                        ? "bg-sky-500/10"
                                        : "hover:bg-white/[0.04]"
                                    }`}
                            >
                                <span className={`text-[10px] font-bold tracking-widest
                                    ${isSelected ? "text-sky-400" : "text-slate-500"}`}>
                                    {short}
                                </span>

                                {/* Active/inactive pill */}
                                <span
                                    onClick={(e) => { e.stopPropagation(); toggleDay(key); }}
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px]
                                        font-semibold ring-1 transition cursor-pointer select-none
                                        ${isActive
                                            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 hover:bg-emerald-500/25"
                                            : "bg-slate-500/15 text-slate-500 ring-white/10 hover:bg-slate-500/25"
                                        }`}
                                >
                                    {isActive ? "On" : "Off"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Grid body: time ruler + day columns */}
                <div className="flex overflow-x-auto">

                    {/* Time ruler */}
                    <div className="shrink-0 w-14 border-r border-white/10">
                        {HOUR_LABELS.map(({ hour, label }) => (
                            <div
                                key={hour}
                                style={{ height: hour === GRID_END ? 20 : ROW_H }}
                                className="flex items-start justify-end pr-2 pt-1"
                            >
                                <span className="text-[10px] text-slate-600 leading-none whitespace-nowrap">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {DAYS.map(({ key }) => {
                        const day = weeklyAvailability.find((d) => d.day === key);
                        const isActive = day?.isActive ?? false;
                        const isSelected = activeDay === key;
                        const startTime = day?.startTime || "09:00";
                        const endTime = day?.endTime || "17:00";

                        const topPx = offsetToPx(timeToOffset(startTime));
                        const heightPx = rangeToPx(startTime, endTime);

                        return (
                            <div
                                key={key}
                                onClick={() => setActiveDay(key)}
                                className={`relative flex-1 min-w-[52px] border-r border-white/10
                                    last:border-r-0 cursor-pointer transition-colors
                                    ${isSelected ? "bg-sky-500/[0.06]" : "hover:bg-white/[0.025]"}`}
                                style={{ height: TOTAL_HOURS * ROW_H }}
                            >
                                {/* Hour divider lines */}
                                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                                    <div
                                        key={i}
                                        className="absolute left-0 right-0 border-t border-white/[0.06]"
                                        style={{ top: i * ROW_H }}
                                    />
                                ))}

                                {/* Half-hour divider lines */}
                                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                                    <div
                                        key={`h-${i}`}
                                        className="absolute left-0 right-0 border-t border-white/[0.03]"
                                        style={{ top: i * ROW_H + ROW_H / 2 }}
                                    />
                                ))}

                                {/* Availability block */}
                                {isActive && (
                                    <div
                                        className={`absolute left-1 right-1 rounded-lg transition-all
                                            ${isSelected
                                                ? "bg-sky-500/30 ring-1 ring-sky-400/50"
                                                : "bg-sky-500/15 ring-1 ring-sky-400/20"
                                            }`}
                                        style={{
                                            top: topPx + 2,
                                            height: Math.max(heightPx - 4, 20),
                                        }}
                                    >
                                        {/* Start / end time labels inside block */}
                                        {heightPx > 44 && (
                                            <div className="flex flex-col justify-between h-full px-1 py-1">
                                                <span className="text-[9px] font-semibold text-sky-300 leading-none">
                                                    {startTime}
                                                </span>
                                                <span className="text-[9px] font-semibold text-sky-300 leading-none">
                                                    {endTime}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Inactive overlay */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,_transparent,_transparent_6px,_rgba(255,255,255,0.015)_6px,_rgba(255,255,255,0.015)_7px)]" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Day editor panel ─────────────────────────────────────────── */}
            {activeDayData && (
                <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl md:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        {/* Day label + toggle */}
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                                    Editing
                                </p>
                                <h2 className="mt-0.5 text-lg font-semibold text-white">
                                    {DAYS.find((d) => d.key === activeDay)?.label}
                                </h2>
                            </div>

                            {/* Toggle button */}
                            <button
                                type="button"
                                onClick={() => toggleDay(activeDay)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5
                                    text-xs font-semibold ring-1 transition
                                    ${activeDayData.isActive
                                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 hover:bg-emerald-500/25"
                                        : "bg-slate-500/15 text-slate-400 ring-white/10 hover:bg-slate-500/25"
                                    }`}
                            >
                                {activeDayData.isActive
                                    ? <><CheckCircle2 className="h-3.5 w-3.5" /> Available</>
                                    : <><XCircle className="h-3.5 w-3.5" /> Unavailable</>
                                }
                            </button>
                        </div>

                        {/* Time pickers */}
                        <div className={`flex flex-wrap gap-4 transition-opacity
                            ${activeDayData.isActive ? "opacity-100" : "opacity-30 pointer-events-none"}`}>

                            {/* Start time */}
                            <div className="grid gap-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                                    Start time
                                </label>
                                <select
                                    value={activeDayData.startTime}
                                    onChange={(e) => updateDay(activeDay, "startTime", e.target.value)}
                                    className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3
                                        text-sm text-white focus:border-sky-400/40 focus:outline-none
                                        focus:ring-1 focus:ring-sky-400/30 cursor-pointer"
                                >
                                    {TIME_OPTIONS.map(({ val, label }) => (
                                        <option key={val} value={val} className="bg-[#0f1729] text-white">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Arrow divider */}
                            <div className="flex items-end pb-2.5 text-slate-600">→</div>

                            {/* End time */}
                            <div className="grid gap-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                                    End time
                                </label>
                                <select
                                    value={activeDayData.endTime}
                                    onChange={(e) => updateDay(activeDay, "endTime", e.target.value)}
                                    className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3
                                        text-sm text-white focus:border-sky-400/40 focus:outline-none
                                        focus:ring-1 focus:ring-sky-400/30 cursor-pointer"
                                >
                                    {TIME_OPTIONS.filter(({ val }) => val > activeDayData.startTime).map(({ val, label }) => (
                                        <option key={val} value={val} className="bg-[#0f1729] text-white">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Save bar ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
                rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-4">

                {/* Message */}
                <p className={`text-sm ${message.ok ? "text-slate-400" : "text-red-400"}`}>
                    {message.text || "Review your schedule and save when ready."}
                </p>

                {/* Save button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl
                        bg-gradient-to-r from-sky-500 to-indigo-500 px-6 text-sm font-semibold
                        text-white shadow-lg shadow-sky-500/20 transition
                        hover:scale-[1.02] hover:shadow-sky-500/30
                        disabled:cursor-not-allowed disabled:opacity-60 shrink-0"
                >
                    {saving
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                        : <><Save className="h-4 w-4" /> Save availability</>
                    }
                </button>
            </div>

        </div>
    );
}