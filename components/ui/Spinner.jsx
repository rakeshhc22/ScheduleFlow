"use client";

export default function Spinner({ size = 24 }) {
    return (
        <div
            style={{ width: size, height: size }}
            className="border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"
        />
    );
}