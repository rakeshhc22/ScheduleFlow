"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    CalendarClock,
    Clock3,
    Globe2,
    User2,
    AlertCircle,
} from "lucide-react";

import CalendarPicker from "@/components/booking/CalendarPicker";
import TimeSlotList from "@/components/booking/TimeSlotList";
import BookingForm from "@/components/booking/BookingForm";
import TimezoneSelector from "@/components/booking/TimezoneSelector";

const FALLBACK_TIMEZONES = [
    "Asia/Kolkata",
    "UTC",
    "Europe/London",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Asia/Dubai",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
];

export default function BookingPage() {
    const { username, eventSlug } = useParams();

    const [date, setDate] = useState("");
    const [timezone, setTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
    );
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [eventData, setEventData] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState("");

    const minDate = useMemo(() => {
        return new Date().toISOString().split("T")[0];
    }, []);

    // ── Fetch event info on mount to validate username/eventSlug ──
    useEffect(() => {
        if (!username || !eventSlug) return;

        const fetchEventInfo = async () => {
            try {
                // Hit the slots API with today's date just to get event + host info
                const today = new Date().toISOString().split("T")[0];
                const res = await fetch(
                    `/api/slots/${username}/${eventSlug}?date=${today}`
                );
                const data = await res.json();

                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }

                if (!res.ok) {
                    setError(data.error || "Failed to load event");
                    return;
                }

                // Store event + host info without overwriting slots
                setEventData(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load event details");
            }
        };

        fetchEventInfo();
    }, [username, eventSlug]);

    // ── Fetch slots when date or timezone changes ──────────
    useEffect(() => {
        if (!date) return;

        const fetchSlots = async () => {
            try {
                setLoadingSlots(true);
                setError("");
                setSelectedSlot(null);

                const res = await fetch(
                    `/api/slots/${username}/${eventSlug}?date=${date}&timezone=${timezone}`
                );
                const data = await res.json();

                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }

                if (!res.ok) {
                    setError(data.error || "Failed to fetch available slots");
                    setSlots([]);
                    return;
                }

                setSlots(Array.isArray(data.slots) ? data.slots : []);
                // Keep event + host info fresh
                setEventData(data);
            } catch (err) {
                console.error(err);
                setError("Something went wrong while loading slots");
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, timezone, username, eventSlug]);

    // ── 404 state ──────────────────────────────────────────
    if (notFound) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07111f] px-4 text-white">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-400/20">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-semibold">Event not found</h1>
                    <p className="mt-3 text-sm text-slate-400">
                        This booking link may be invalid or the event may have been
                        deactivated.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_1.2fr]">

                {/* ── Left panel — event info ── */}
                <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Schedule a meeting
                    </div>

                    <div className="mt-6">
                        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            {eventData?.event?.title || "Book a time"}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                            {eventData?.event?.description ||
                                "Pick a suitable date and time, then confirm your details to schedule the appointment."}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        {/* Fix: use host.name from API response — now returned correctly */}
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                            <User2 className="h-4 w-4 shrink-0 text-sky-300" />
                            Hosted by{" "}
                            <span className="font-medium text-white">
                                {eventData?.host?.name || username}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                            <Clock3 className="h-4 w-4 shrink-0 text-sky-300" />
                            {eventData?.event?.duration
                                ? `${eventData.event.duration} minutes`
                                : "Duration not set"}
                        </div>

                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                            <Globe2 className="h-4 w-4 shrink-0 text-sky-300" />
                            {timezone}
                        </div>
                    </div>

                    {/* Event color dot */}
                    {eventData?.event?.color && (
                        <div className="mt-6 flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                                style={{ backgroundColor: eventData.event.color }}
                            />
                            <span className="text-xs text-slate-500">
                                {eventData.event.location || "Google Meet / Video Call"}
                            </span>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {error}
                        </div>
                    )}
                </section>

                {/* ── Right panel — booking controls ── */}
                <section className="space-y-6">
                    <TimezoneSelector
                        value={timezone}
                        onChange={setTimezone}
                        timezones={FALLBACK_TIMEZONES}
                    />

                    <CalendarPicker
                        selectedDate={date}
                        onChange={setDate}
                        minDate={minDate}
                    />

                    <TimeSlotList
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSelect={setSelectedSlot}
                        loading={loadingSlots}
                    />

                    {/* Show booking form only after a slot is selected */}
                    {selectedSlot && (
                        <BookingForm
                            selectedSlot={selectedSlot}
                            hostUsername={username}
                            eventData={eventData}
                            timezone={timezone}
                        />
                    )}
                </section>
            </div>
        </div>
    );
}