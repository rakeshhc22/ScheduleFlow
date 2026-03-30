"use client";

export default function Toggle({ enabled, onChange }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${enabled ? "bg-purple-600" : "bg-gray-300"
                }`}
        >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${enabled ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </button>
    );
}