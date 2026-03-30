"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`px-4 py-2 rounded-lg shadow text-white ${type === "error" ? "bg-red-500" : "bg-green-500"
                    }`}
            >
                {message}
            </div>
        </div>
    );
}