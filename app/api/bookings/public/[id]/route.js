// app/api/bookings/public/[id]/route.js
// Public GET endpoint — no authentication required.
//
// Purpose:
//   Allows a guest (the person who made a booking) to fetch their own
//   booking details after the booking flow is complete. This is used
//   exclusively by app/booking-confirmed/page.jsx.
//
// Why separate from /api/bookings/[id]:
//   The existing route requires a valid session (logged-in host).
//   Guests are not logged in, so they cannot call that route.
//   This route is intentionally read-only and returns only the fields
//   the guest needs — no sensitive host data is exposed.
//
// Security:
//   - MongoDB ObjectIDs (24-char hex) are not guessable — safe to expose by ID
//   - Only confirmed/completed bookings are returned (cancelled ones show an error)
//   - Response is deliberately limited to guest-safe fields only

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const booking = await Booking.findById(params.id)
            .populate("eventType", "title duration color locationType location")
            .populate("host", "name email")
            .lean();

        // Booking not found
        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Do not expose cancelled bookings to guests
        if (booking.status === "cancelled") {
            return NextResponse.json(
                { error: "This booking has been cancelled" },
                { status: 410 }
            );
        }

        // Return only the fields the guest-facing page needs
        // Deliberately excludes: googleEventId, cancelReason, cancelledAt,
        // host email, and any other internal fields
        const safeBooking = {
            _id: booking._id,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timezone: booking.timezone,
            notes: booking.notes,
            status: booking.status,
            eventType: booking.eventType
                ? {
                    title: booking.eventType.title,
                    duration: booking.eventType.duration,
                    color: booking.eventType.color,
                    locationType: booking.eventType.locationType,
                    location: booking.eventType.location,
                }
                : null,
            host: booking.host
                ? {
                    name: booking.host.name,
                }
                : null,
        };

        return NextResponse.json({ booking: safeBooking });
    } catch (error) {
        console.error("[PUBLIC_BOOKING_GET]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}