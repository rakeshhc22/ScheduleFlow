"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User2, Mail, FileText, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function BookingForm({
    selectedSlot,
    hostUsername,
    eventData,
    timezone,
}) {
    const router = useRouter();

    const [form, setForm] = useState({ name: "", email: "", notes: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // ── Client-side validation ──────────────────────────
    function validate() {
        if (!form.name.trim()) return "Full name is required";
        if (!form.email.trim()) return "Email address is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return "Please enter a valid email address";

        return null;
    }

    // ── Submit — calls POST /api/bookings ───────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!selectedSlot || !eventData?.event?._id) {
            setError("Missing booking details. Please select a time slot.");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventTypeId: eventData.event._id,
                    hostUsername,
                    startTime: selectedSlot.start,
                    guestName: form.name.trim(),
                    guestEmail: form.email.trim(),
                    guestTimezone: timezone,
                    notes: form.notes.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to confirm booking. Please try again.");
                return;
            }

            // Success — redirect to confirmation page
            setSuccess(true);
            router.push(
                `/booking-confirmed?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}&start=${encodeURIComponent(selectedSlot.start)}&end=${encodeURIComponent(selectedSlot.end)}&timezone=${encodeURIComponent(timezone)}&event=${encodeURIComponent(eventData.event.title || "")}`
            );
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success state (shown briefly before redirect) ──
    if (success) {
        return (
            <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Booking confirmed!</h3>
                <p className="mt-2 text-sm text-slate-400">Redirecting you to your confirmation...</p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl md:p-8"
        >
            {/* Header */}
            <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                    Booking details
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                    Enter your information
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    This information will be shared with the host for the scheduled meeting.
                </p>
            </div>

            {/* Selected slot summary */}
            {selectedSlot && (
                <div className="mb-5 rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                    <span className="font-medium">Selected time: </span>
                    {new Date(selectedSlot.start).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: timezone,
                    })}{" "}
                    –{" "}
                    {new Date(selectedSlot.end).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: timezone,
                    })}
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-white">
                        Full name <span className="text-red-400">*</span>
                    </label>
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-sky-400/40">
                        <User2 className="h-4 w-4 shrink-0 text-sky-300" />
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-white">
                        Email address <span className="text-red-400">*</span>
                    </label>
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-sky-400/40">
                        <Mail className="h-4 w-4 shrink-0 text-sky-300" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-white">
                        Notes <span className="text-slate-500">(optional)</span>
                    </label>
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-sky-400/40">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Add anything the host should know before the meeting"
                            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ArrowRight className="h-4 w-4" />
                )}
                {submitting ? "Booking..." : "Confirm Booking"}
            </button>
        </form>
    );
}