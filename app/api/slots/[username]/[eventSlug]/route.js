import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import EventType from "@/models/EventType";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";

const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

function timeToMinutes(time) {
    const [hours, minutes] = String(time).split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function combineDateAndTime(dateString, timeString) {
    return new Date(`${dateString}T${timeString}:00`);
}

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Fix: await params for Next.js 15
        const { username, eventSlug } = await params;
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "Date query parameter is required" },
                { status: 400 }
            );
        }

        // Fix: reject past dates upfront
        const today = new Date().toISOString().split("T")[0];
        if (date < today) {
            return NextResponse.json(
                { slots: [], timezone: "Asia/Kolkata", event: null },
                { status: 200 }
            );
        }

        const selectedDate = new Date(`${date}T00:00:00`);
        if (Number.isNaN(selectedDate.getTime())) {
            return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        }

        // Load user
        const user = await User.findOne({ username }).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Load event type
        const event = await EventType.findOne({
            owner: user._id,
            slug: eventSlug,
            isActive: true,
        }).lean();

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Load availability
        let availability = await Availability.findOne({ user: user._id }).lean();
        if (!availability) {
            availability = { timezone: "Asia/Kolkata", weeklyAvailability: [] };
        }

        // Find what day of the week the selected date is
        const dayKey = DAY_KEYS[selectedDate.getDay()];
        const dayAvailability = availability.weeklyAvailability?.find(
            (item) => item.day === dayKey
        );

        // Day is disabled — return empty slots
        if (!dayAvailability || !dayAvailability.isActive) {
            return NextResponse.json(
                { slots: [], timezone: availability.timezone || "Asia/Kolkata", event },
                { status: 200 }
            );
        }

        const startMinutes = timeToMinutes(dayAvailability.startTime);
        const endMinutes = timeToMinutes(dayAvailability.endTime);
        const duration = Number(event.duration);

        if (
            Number.isNaN(startMinutes) ||
            Number.isNaN(endMinutes) ||
            Number.isNaN(duration) ||
            startMinutes >= endMinutes
        ) {
            return NextResponse.json(
                { error: "Invalid availability configuration" },
                { status: 400 }
            );
        }

        // Fix: load already-confirmed bookings for this host on this date
        const dayStart = new Date(`${date}T00:00:00`);
        const dayEnd = new Date(`${date}T23:59:59`);

        const existingBookings = await Booking.find({
            host: user._id,
            status: { $ne: "cancelled" },
            startTime: { $gte: dayStart, $lte: dayEnd },
        })
            .select("startTime endTime")
            .lean();

        const now = new Date();

        // Build slots — excluding already-booked and past slots
        const slots = [];

        for (
            let current = startMinutes;
            current + duration <= endMinutes;
            current += duration
        ) {
            const startTime = minutesToTime(current);
            const endTime = minutesToTime(current + duration);

            const slotStart = combineDateAndTime(date, startTime);
            const slotEnd = combineDateAndTime(date, endTime);

            // Fix: skip slots that are already in the past
            if (slotStart <= now) continue;

            // Fix: skip slots that overlap with an existing confirmed booking
            const isBooked = existingBookings.some(
                (booking) =>
                    slotStart < new Date(booking.endTime) &&
                    slotEnd > new Date(booking.startTime)
            );
            if (isBooked) continue;

            slots.push({
                startTime,
                endTime,
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
            });
        }

        return NextResponse.json(
            {
                slots,
                timezone: availability.timezone || "Asia/Kolkata",
                event,
                host: { name: user.name, username: user.username },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/slots/[username]/[eventSlug] error:", error);
        return NextResponse.json(
            { error: "Failed to generate slots" },
            { status: 500 }
        );
    }
}