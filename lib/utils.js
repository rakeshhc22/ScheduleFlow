import { clsx } from "clsx";

// Combine Tailwind classes safely
export function cn(...inputs) {
    return clsx(inputs);
}

// Generate a URL-safe slug from a string
export function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Format duration in minutes to human-readable string
export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
}

// Format a Date to "Mon, Jan 1, 2025" style
export function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Format a Date to "9:00 AM" style
export function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// Get initials from a full name (e.g. "John Doe" → "JD")
export function getInitials(name) {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// Return an API error response object
export function apiError(message, status = 400) {
    return { error: message, status };
}

// Day names array (Sunday=0)
export const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

// Color options for event types
export const EVENT_COLORS = [
    { label: "Blue", value: "#3B82F6" },
    { label: "Green", value: "#10B981" },
    { label: "Purple", value: "#8B5CF6" },
    { label: "Pink", value: "#EC4899" },
    { label: "Orange", value: "#F59E0B" },
    { label: "Red", value: "#EF4444" },
    { label: "Teal", value: "#14B8A6" },
];