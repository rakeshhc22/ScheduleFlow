"use client";

import { useEffect, useState } from "react";
import BookingRow from "@/components/dashboard/BookingRow";
import { CalendarCheck2, AlertCircle } from "lucide-react";

const STATUS_TABS = [
    { key: "", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("");

    const fetchBookings = async (status = "") => {
        try {
            setLoading(true);
            setError("");

            const url = status
                ? `/api/bookings?status=${status}`
                : "/api/bookings";

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load bookings.");
                setBookings([]);
                return;
            }

            setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(activeTab);
    }, [activeTab]);

    // Called by BookingRow after a successful cancel
    const handleCancelled = (id) => {
        setBookings((prev) =>
            prev.map((b) =>
                b._id === id ? { ...b, status: "cancelled" } : b
            )
        );
    };

    // Called by BookingRow after a hard delete
    const handleDeleted = (id) => {
        setBookings((prev) => prev.filter((b) => b._id !== id));
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20">
                        <CalendarCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                            Bookings
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            Manage appointments
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Review scheduled meetings, cancel or remove bookings when necessary.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Status filter tabs ── */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`inline-flex h-9 shrink-0 items-center rounded-xl px-4 text-sm font-medium transition ${activeTab === tab.key
                                ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30"
                                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                    <button
                        onClick={() => fetchBookings(activeTab)}
                        className="ml-auto underline underline-offset-2 hover:text-red-200"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]"
                        />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">No bookings found</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        {activeTab === "upcoming"
                            ? "You have no upcoming meetings scheduled."
                            : activeTab === "past"
                                ? "No past meetings found."
                                : activeTab === "cancelled"
                                    ? "No cancelled bookings."
                                    : "Once guests book a meeting, they will appear here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <BookingRow
                            key={booking._id}
                            booking={booking}
                            onCancelled={handleCancelled}
                            onDeleted={handleDeleted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}