"use client";

import { useState } from "react";
import { Settings2, Save, Loader2, User2, Mail } from "lucide-react";

export default function SettingsPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage("");

            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || "Profile updated successfully");
            } else {
                setMessage(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong while updating profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(5,10,20,0.96))] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20">
                        <Settings2 className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/70">
                            Account settings
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            Manage your profile
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Update your personal information used across your ScheduleFlow
                            workspace and public booking experience.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl md:p-8">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">Full name</label>
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4">
                            <User2 className="h-4 w-4 text-sky-300" />
                            <input
                                value={form.name}
                                placeholder="Enter your name"
                                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">Email address</label>
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4">
                            <Mail className="h-4 w-4 text-sky-300" />
                            <input
                                type="email"
                                value={form.email}
                                placeholder="Enter your email"
                                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, email: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-400">
                            {message ? message : "Save your latest profile changes."}
                        </p>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
