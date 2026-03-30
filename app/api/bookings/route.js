// app/api/bookings/route.js
// GET  → list bookings for logged-in host
// POST → create a new booking (public — no auth required)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import EventType from "@/models/EventType";
import User from "@/models/User";
import Availability from "@/models/Availability";
import { sendBookingConfirmation } from "@/lib/email";
import { createCalendarEvent } from "@/lib/google-calendar";

// ── GET /api/bookings ────────────────────────────────────
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userId = session.user.id || session.user._id;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // "upcoming" | "past" | "cancelled"
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // schema field name is "host"
        const query = { host: userId };

        if (status === "upcoming") {
            query.startTime = { $gte: new Date() };
            query.status = { $ne: "cancelled" };
        } else if (status === "past") {
            query.startTime = { $lt: new Date() };
            query.status = { $ne: "cancelled" };
        } else if (status === "cancelled") {
            query.status = "cancelled";
        }

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .sort({ startTime: status === "past" ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                // populate correct field "eventType"
                .populate("eventType", "title duration color location")
                .lean(),
            Booking.countDocuments(query),
        ]);

        return NextResponse.json({
            bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[BOOKINGS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── POST /api/bookings ───────────────────────────────────
export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const {
            eventTypeId,
            hostUsername,
            startTime,
            guestName,
            guestEmail,
            guestTimezone,
            notes,
        } = body;

        // ── Validate required fields ────────────────────────
        if (!eventTypeId || !hostUsername || !startTime || !guestName || !guestEmail) {
            return NextResponse.json(
                { error: "Missing required booking fields" },
                { status: 400 }
            );
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // ── Load host + event type ──────────────────────────
        const [host, eventType] = await Promise.all([
            User.findOne({ username: hostUsername }).lean(),
            EventType.findById(eventTypeId).lean(),
        ]);

        if (!host) {
            return NextResponse.json({ error: "Host not found" }, { status: 404 });
        }
        if (!eventType || !eventType.isActive) {
            return NextResponse.json(
                { error: "Event type not found or inactive" },
                { status: 404 }
            );
        }

        // schema field is "owner"
        if (eventType.owner.toString() !== host._id.toString()) {
            return NextResponse.json(
                { error: "Invalid event type for this host" },
                { status: 400 }
            );
        }

        // ── Calculate slot boundaries ───────────────────────
        const start = new Date(startTime);
        if (Number.isNaN(start.getTime())) {
            return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
        }

        // Reject past bookings
        if (start <= new Date()) {
            return NextResponse.json(
                { error: "Cannot book a slot in the past" },
                { status: 400 }
            );
        }

        const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

        // ── Check availability config exists ────────────────
        // schema field is "user"
        const availability = await Availability.findOne({ user: host._id }).lean();
        if (!availability) {
            return NextResponse.json(
                { error: "Host has not configured availability" },
                { status: 400 }
            );
        }

        // ── Check slot is not already booked ────────────────
        const conflict = await Booking.findOne({
            host: host._id,
            status: { $ne: "cancelled" },
            $or: [
                { startTime: { $lt: end, $gte: start } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } },
            ],
        });

        if (conflict) {
            return NextResponse.json(
                { error: "Selected time slot is no longer available" },
                { status: 409 }
            );
        }

        // ── Create booking ──────────────────────────────────
        // FIX 2: explicitly save guestName + guestEmail so the dashboard can read them
        const booking = await Booking.create({
            host: host._id,
            eventType: eventType._id,
            guestName: guestName.trim(),           // ← was already correct in schema; now
            guestEmail: guestEmail.toLowerCase().trim(), // ← explicitly confirmed saved
            timezone: guestTimezone || availability.timezone || "Asia/Kolkata",
            startTime: start,
            endTime: end,
            notes: notes?.trim() || "",
            status: "confirmed",
        });

        // ── Side effects (non-blocking) ─────────────────────
        const sideEffects = [];

        // Google Calendar sync if host has connected their account
        if (host.googleAccessToken) {
            sideEffects.push(
                createCalendarEvent({
                    accessToken: host.googleAccessToken,
                    refreshToken: host.googleRefreshToken,
                    title: `${eventType.title} with ${guestName}`,
                    description: notes || "",
                    start,
                    end,
                    attendees: [{ email: guestEmail, name: guestName }],
                }).catch((err) => console.error("[CALENDAR_CREATE]", err))
            );
        }

        // ── FIX 1: Pass the correct nested shape that email.js expects ──
        // email.js signature: sendBookingConfirmation({ booking, eventType, hostName, hostEmail })
        // It reads booking.startTime, booking.guestEmail, booking.guestName, etc.
        // The old call was passing a flat object — that caused the TypeError.
        sideEffects.push(
            sendBookingConfirmation({
                booking,          // ← full Mongoose doc; email.js reads .startTime, .endTime, .guestName, etc.
                eventType,        // ← full eventType object; email.js reads .title, .duration
                hostName: host.name,
                hostEmail: host.email,
            }).catch((err) => console.error("[EMAIL_CONFIRM]", err))
        );

        await Promise.allSettled(sideEffects);

        return NextResponse.json(
            {
                booking: {
                    id: booking._id,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    status: booking.status,
                    guestName: booking.guestName,       // ← included in response for dashboard
                    guestEmail: booking.guestEmail,     // ← included in response for dashboard
                    eventType: { title: eventType.title, duration: eventType.duration },
                    host: { name: host.name, email: host.email },
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[BOOKINGS_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}