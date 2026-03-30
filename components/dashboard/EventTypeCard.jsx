"use client";

// components/dashboard/EventTypeCard.jsx
// Card displayed in the Event Types list page.
// Shows event name, duration, color, link copy button, and edit/delete actions.

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Clock,
    Link2,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    Globe,
    Video,
    Phone,
    MapPin,
} from "lucide-react";

// ── Location type icon map ────────────────────────────────────────────────────
const LOCATION_ICONS = {
    video: { icon: Video, label: "Video Call" },
    phone: { icon: Phone, label: "Phone Call" },
    in_person: { icon: MapPin, label: "In Person" },
    other: { icon: Globe, label: "Custom" },
};

/**
 * @param {object}   eventType        - EventType document from MongoDB
 * @param {string}   username         - Owner's username (for booking link)
 * @param {function} onDelete         - Called with eventType._id when delete is confirmed
 */
export default function EventTypeCard({ eventType, username, onDelete }) {
    const [copied, setCopied] = useState(false);

    // Public booking URL for this event type
    const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${username}/${eventType.slug}`;

    // Copy booking link to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(bookingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const el = document.createElement("input");
            el.value = bookingUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const locationInfo = LOCATION_ICONS[eventType.locationType] ?? LOCATION_ICONS.other;
    const LocationIcon = locationInfo.icon;

    return (
        <div
            className={cn(
                "relative flex flex-col rounded-xl bg-[#13131a] border border-white/[0.06]",
                "hover:border-white/10 transition-colors overflow-hidden group",
                !eventType.isActive && "opacity-60"
            )}
        >
            {/* ── Color accent bar (uses eventType.color) ── */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: eventType.color ?? "#7c3aed" }}
            />

            {/* ── Card body ── */}
            <div className="p-5 pt-6 flex-1">

                {/* Top row: active badge + menu */}
                <div className="flex items-start justify-between mb-3">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-medium border-0 px-2 py-0.5",
                            eventType.isActive
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-white/[0.06] text-white/35"
                        )}
                    >
                        {eventType.isActive ? "Active" : "Inactive"}
                    </Badge>

                    {/* 3-dot action menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical size={15} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-44 bg-[#1a1a24] border-white/10 text-white shadow-xl"
                        >
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/event-types/${eventType._id}/edit`}
                                    className="flex items-center gap-2 text-white/60 hover:text-white cursor-pointer text-[13px]"
                                >
                                    <Pencil size={13} />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleCopy}
                                className="flex items-center gap-2 text-white/60 hover:text-white cursor-pointer text-[13px]"
                            >
                                <Link2 size={13} />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/[0.06]" />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(eventType._id)}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-[13px]"
                            >
                                <Trash2 size={13} />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Event name */}
                <h3 className="text-white font-semibold text-[15px] leading-snug mb-1 truncate">
                    {eventType.title}
                </h3>

                {/* Description */}
                {eventType.description && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">
                        {eventType.description}
                    </p>
                )}

                {/* Meta: duration + location */}
                <div className="flex items-center gap-3 mt-auto">
                    <span className="flex items-center gap-1.5 text-white/40 text-xs">
                        <Clock size={12} />
                        {eventType.duration} min
                    </span>
                    <span className="flex items-center gap-1.5 text-white/40 text-xs">
                        <LocationIcon size={12} />
                        {locationInfo.label}
                    </span>
                </div>
            </div>

            {/* ── Footer: copy link button ── */}
            <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.02]">
                <button
                    onClick={handleCopy}
                    className={cn(
                        "flex items-center gap-2 text-xs font-medium transition-colors",
                        copied ? "text-emerald-400" : "text-white/35 hover:text-white/65"
                    )}
                >
                    {copied ? (
                        <>
                            <Check size={12} />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Link2 size={12} />
                            <span className="truncate max-w-[200px]">
                                /{username}/{eventType.slug}
                            </span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}