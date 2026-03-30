"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CalendarRange, Clock3, ArrowRight, User2 } from "lucide-react";

export default function PublicProfilePage() {
    const { username } = useParams();

    const [profile, setProfile] = useState(null);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/public/${username}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Failed to load public page");
                    return;
                }

                setProfile(data.host || null);
                setEvents(Array.isArray(data.events) ? data.events : []);
            } catch (err) {
                console.error(err);
                setError("Something went wrong while loading this page");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    return (
        <div className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
                <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-8 shadow-[0_20px_80px_rgba(2,6,23,0.35)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                        <User2 className="h-3.5 w-3.5" />
                        Public booking page
                    </div>

                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                        {profile?.name || username}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                        Choose an event type below to schedule a meeting without back-and-forth emails.
                    </p>
                </section>

                {error ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-40 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]"
                            />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] px-6 py-14 text-center">
                        <h2 className="text-lg font-semibold text-white">
                            No event types available
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            This user has not published any active event types yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <Link
                                key={event._id}
                                href={`/${username}/${event.slug}`}
                                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.06]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {event.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {event.description || "Book this meeting type."}
                                        </p>
                                    </div>

                                    <span
                                        className="mt-1 h-3 w-3 rounded-full ring-2 ring-white/10"
                                        style={{ backgroundColor: event.color || "#7c3aed" }}
                                    />
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
                                        <Clock3 className="h-4 w-4 text-sky-300" />
                                        {event.duration} min
                                    </div>

                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition group-hover:text-sky-200">
                                        Book now
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
