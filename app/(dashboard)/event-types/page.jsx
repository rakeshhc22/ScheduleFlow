"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarRange,
    Clock3,
    ArrowRight,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

export default function EventTypesPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    // ── Fetch all events ──────────────────────────────────
    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch events");
            setEvents(Array.isArray(data.events) ? data.events : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ── Delete event ──────────────────────────────────────
    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this event type?")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete event");
            setEvents((prev) => prev.filter((e) => e._id !== id));
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to delete event. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    // ── Toggle active/inactive ────────────────────────────
    async function handleToggleActive(event) {
        setTogglingId(event._id);
        try {
            const res = await fetch(`/api/events/${event._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !event.isActive }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update event");
            setEvents((prev) =>
                prev.map((e) => (e._id === event._id ? data.event : e))
            );
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update event. Please try again.");
        } finally {
            setTogglingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                            Event setup
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            Event types
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                            Create and manage the meeting templates guests can book from your
                            public scheduling page.
                        </p>
                    </div>

                    <Link
                        href="/event-types/new"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30"
                    >
                        <Plus className="h-4 w-4" />
                        New Event
                    </Link>
                </div>
            </section>

            {/* ── Error Banner ── */}
            {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    {error}
                    <button
                        onClick={fetchEvents}
                        className="ml-3 underline underline-offset-2 hover:text-red-200"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Loading Skeletons ── */}
            {loading ? (
                <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-32 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]"
                        />
                    ))}
                </div>
            ) : events.length === 0 ? (
                /* ── Empty State ── */
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-xl">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20">
                        <CalendarRange className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No event types created yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                        Create your first event type to let guests book meetings from your
                        ScheduleFlow page.
                    </p>
                    <Link
                        href="/event-types/new"
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30"
                    >
                        <Plus className="h-4 w-4" />
                        Create Event Type
                    </Link>
                </div>
            ) : (
                /* ── Event Cards Grid ── */
                <div className="grid gap-4 xl:grid-cols-2">
                    {events.map((event) => (
                        <div
                            key={event._id}
                            className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:bg-white/[0.06]"
                        >
                            {/* ── Card Header ── */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/10"
                                            style={{ backgroundColor: event.color || "#7c3aed" }}
                                        />
                                        <h2 className="truncate text-base font-semibold text-white">
                                            {event.title}
                                        </h2>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-400">/{event.slug}</p>

                                    {event.description ? (
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                                            {event.description}
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                            No description added yet.
                                        </p>
                                    )}
                                </div>

                                {/* ── Active Toggle Badge ── */}
                                <button
                                    onClick={() => handleToggleActive(event)}
                                    disabled={togglingId === event._id}
                                    title={event.isActive ? "Click to deactivate" : "Click to activate"}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition disabled:opacity-50 ${event.isActive
                                            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20 hover:bg-emerald-500/25"
                                            : "bg-slate-500/15 text-slate-300 ring-white/10 hover:bg-slate-500/25"
                                        }`}
                                >
                                    {event.isActive ? (
                                        <ToggleRight className="h-3.5 w-3.5" />
                                    ) : (
                                        <ToggleLeft className="h-3.5 w-3.5" />
                                    )}
                                    {togglingId === event._id
                                        ? "Saving..."
                                        : event.isActive
                                            ? "Active"
                                            : "Inactive"}
                                </button>
                            </div>

                            {/* ── Meta Info ── */}
                            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                    <Clock3 className="h-4 w-4 text-sky-300" />
                                    {event.duration} min
                                </div>

                                <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-400">
                                    {event.location || "Google Meet / Video Call"}
                                </div>
                            </div>

                            {/* ── Card Footer ── */}
                            <div className="mt-5 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    {Array.isArray(event.questions) ? event.questions.length : 0}{" "}
                                    custom questions
                                </p>

                                <div className="flex items-center gap-4">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        disabled={deletingId === event._id}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {deletingId === event._id ? "Deleting..." : "Delete"}
                                    </button>

                                    {/* Edit Link */}
                                    <Link
                                        href={`/event-types/${event._id}/edit`}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-sky-200"
                                    >
                                        Edit
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}