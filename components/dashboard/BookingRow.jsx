"use client";

import { useState } from "react";
import {
    CalendarDays,
    Clock3,
    Mail,
    User2,
    Pencil,
    Trash2,
    Check,
    X,
    Loader2,
} from "lucide-react";

export default function BookingRow({ booking, onDeleted, onUpdated }) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // FIX: was reading booking.name / booking.email
    // Schema fields are guestName and guestEmail
    const [form, setForm] = useState({
        guestName: booking?.guestName || "",
        guestEmail: booking?.guestEmail || "",
    });

    const start = booking?.startTime ? new Date(booking.startTime) : null;

    const handleUpdate = async () => {
        try {
            setSaving(true);

            const res = await fetch(`/api/bookings/${booking._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                // FIX: send guestName / guestEmail, not name / email
                body: JSON.stringify({
                    ...booking,
                    guestName: form.guestName,
                    guestEmail: form.guestEmail,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setIsEditing(false);
                onUpdated?.(data.booking);
            } else {
                alert(data.error || "Failed to update booking");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while updating booking");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this booking?"
        );
        if (!confirmed) return;

        try {
            setDeleting(true);

            const res = await fetch(`/api/bookings/${booking._id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                onDeleted?.(booking._id);
            } else {
                alert(data.error || "Failed to delete booking");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while deleting booking");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:bg-white/[0.06]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3">
                    {isEditing ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-slate-400">
                                    Guest name
                                </label>
                                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3">
                                    <User2 className="h-4 w-4 text-sky-300" />
                                    <input
                                        value={form.guestName}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, guestName: e.target.value }))
                                        }
                                        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                        placeholder="Guest name"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-slate-400">
                                    Email
                                </label>
                                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3">
                                    <Mail className="h-4 w-4 text-sky-300" />
                                    <input
                                        value={form.guestEmail}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, guestEmail: e.target.value }))
                                        }
                                        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                        placeholder="Guest email"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                {/* FIX: was booking.name → booking.guestName */}
                                <p className="text-sm font-semibold text-white">
                                    {booking?.guestName || "Guest"}
                                </p>
                                {/* FIX: was booking.email → booking.guestEmail */}
                                <p className="mt-1 text-sm text-slate-400">
                                    {booking?.guestEmail || "No email"}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                    <CalendarDays className="h-4 w-4 text-sky-300" />
                                    {start ? start.toLocaleDateString() : "No date"}
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                    <Clock3 className="h-4 w-4 text-sky-300" />
                                    {start
                                        ? start.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "No time"}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/20 transition hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Save
                            </button>

                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    // FIX: reset to guestName / guestEmail
                                    setForm({
                                        guestName: booking?.guestName || "",
                                        guestEmail: booking?.guestEmail || "",
                                    });
                                }}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-4 text-sm font-medium text-rose-300 ring-1 ring-rose-400/20 transition hover:bg-rose-500/15 disabled:opacity-60"
                            >
                                {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}