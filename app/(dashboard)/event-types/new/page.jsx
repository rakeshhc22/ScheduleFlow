"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function NewEventPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        slug: "",
        description: "",
        duration: 30,
        color: "#7c3aed",
        isActive: true,
        location: "Google Meet / Video Call",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ── Slug preview ──────────────────────────────────────
    const slugPreview = useMemo(() => {
        return form.slug?.trim() ? `/${form.slug}` : "/your-event-slug";
    }, [form.slug]);

    // ── Handlers ──────────────────────────────────────────
    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleTitleChange = (value) => {
        const generatedSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

        setForm((prev) => ({
            ...prev,
            title: value,
            // Auto-generate slug only while user hasn't manually edited it
            slug: prev.slug === autoSlug(prev.title) ? generatedSlug : prev.slug,
        }));
    };

    // Helper to mirror the auto-slug logic
    function autoSlug(title = "") {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }

    // ── Validation ────────────────────────────────────────
    function validate() {
        if (!form.title.trim()) return "Title is required";
        if (!form.slug.trim()) return "Slug is required";
        if (!DURATIONS.includes(form.duration)) return "Invalid duration selected";
        return null;
    }

    // ── Submit ────────────────────────────────────────────
    const handleSubmit = async () => {
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create event. Please try again.");
                return;
            }

            router.push("/event-types");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* ── Back Link ── */}
            <div className="flex items-center justify-between">
                <Link
                    href="/event-types"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Event Types
                </Link>
            </div>

            {/* ── Header ── */}
            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20">
                        <CalendarPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                            New event type
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            Create a booking template
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Set up how guests book this meeting, including duration, location,
                            active status, and visual identity.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Form ── */}
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl md:p-8">
                <div className="grid gap-6">

                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={form.title}
                            placeholder="30 Minute Intro Call"
                            className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                    </div>

                    {/* Slug */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">
                            Slug <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={form.slug}
                            placeholder="30-minute-intro-call"
                            className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                            onChange={(e) => handleChange("slug", e.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                            Public link preview:{" "}
                            <span className="text-sky-400/70">{slugPreview}</span>
                        </p>
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">Description</label>
                        <textarea
                            value={form.description}
                            rows={4}
                            placeholder="Add a short description so guests know what this meeting is for."
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </div>

                    {/* Duration + Location */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-white">Duration</label>
                            <select
                                value={form.duration}
                                className="h-12 rounded-xl border border-white/10 bg-[#0d1728] px-4 text-sm text-white focus:border-sky-400/40 focus:outline-none"
                                onChange={(e) => handleChange("duration", Number(e.target.value))}
                            >
                                {DURATIONS.map((d) => (
                                    <option key={d} value={d}>
                                        {d} min
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-white">Location</label>
                            <input
                                value={form.location}
                                placeholder="Google Meet / Video Call"
                                className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Color + Status */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-white">Color</label>
                            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3">
                                <input
                                    type="color"
                                    value={form.color}
                                    className="h-8 w-10 rounded border-none bg-transparent p-0"
                                    onChange={(e) => handleChange("color", e.target.value)}
                                />
                                <span className="text-sm text-slate-300">{form.color}</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-white">Status</label>
                            <button
                                type="button"
                                onClick={() => handleChange("isActive", !form.isActive)}
                                className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-medium transition ${form.isActive
                                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                        : "border-white/10 bg-white/[0.04] text-slate-300"
                                    }`}
                            >
                                <span>{form.isActive ? "Active" : "Inactive"}</span>
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${form.isActive ? "bg-emerald-400" : "bg-slate-500"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Link
                            href="/event-types"
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                        >
                            Cancel
                        </Link>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? "Creating..." : "Create Event"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}