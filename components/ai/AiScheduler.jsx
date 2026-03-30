"use client";

import { useState } from "react";

export default function AiScheduler({
    slots = [],
    timezone,
    onSelectSlot,
}) {
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState(null);

    const handleSuggest = async () => {
        if (!slots.length) {
            alert("No slots available");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/ai/suggest", {
                method: "POST",
                body: JSON.stringify({
                    slots,
                    timezone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "AI failed");
                return;
            }

            setSuggestion(data.suggestedSlot);
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (iso) => {
        return new Date(iso).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <div className="border rounded-xl p-4 space-y-3 bg-purple-50">
            <h3 className="font-semibold text-purple-700">
                🤖 AI Smart Scheduler
            </h3>

            <button
                onClick={handleSuggest}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full"
            >
                {loading ? "Analyzing..." : "Suggest Best Time"}
            </button>

            {suggestion && (
                <div className="bg-white border rounded-lg p-3 mt-2">
                    <p className="text-sm text-gray-600">
                        Suggested Time:
                    </p>

                    <p className="font-medium">
                        {formatTime(suggestion)}
                    </p>

                    <button
                        onClick={() => onSelectSlot(suggestion)}
                        className="mt-2 w-full border border-purple-600 text-purple-600 py-1 rounded-lg hover:bg-purple-100"
                    >
                        Use This Slot
                    </button>
                </div>
            )}
        </div>
    );
}