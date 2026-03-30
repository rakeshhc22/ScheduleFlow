import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Availability from "@/models/Availability";

const DEFAULT_WEEKLY_AVAILABILITY = [
    { day: "monday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "tuesday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "wednesday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "thursday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "friday", isActive: true, startTime: "09:00", endTime: "17:00" },
    { day: "saturday", isActive: false, startTime: "09:00", endTime: "17:00" },
    { day: "sunday", isActive: false, startTime: "09:00", endTime: "17:00" },
];

// Valid IANA timezones we accept (covers all common zones)
const VALID_TIMEZONES = Intl.supportedValuesOf("timeZone");

function getSessionUserId(session) {
    return (
        session?.user?.id ||
        session?.user?._id ||
        session?.user?.userId ||
        null
    );
}

function isValidTime(value) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function isValidTimezone(tz) {
    try {
        // VALID_TIMEZONES may not exist in all environments — fallback to try/catch
        if (VALID_TIMEZONES) return VALID_TIMEZONES.includes(tz);
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

function normalizeWeeklyAvailability(input = []) {
    const map = new Map(
        Array.isArray(input) ? input.map((item) => [item.day, item]) : []
    );
    return DEFAULT_WEEKLY_AVAILABILITY.map((defaultDay) => ({
        ...defaultDay,
        ...(map.get(defaultDay.day) || {}),
    }));
}

function validateWeeklyAvailability(weeklyAvailability) {
    for (const day of weeklyAvailability) {
        if (!day?.day) return "Invalid availability day";

        if (!isValidTime(day.startTime) || !isValidTime(day.endTime)) {
            return `Invalid time format for ${day.day}`;
        }

        if (day.isActive && day.startTime >= day.endTime) {
            return `Start time must be earlier than end time for ${day.day}`;
        }
    }
    return null;
}

// ── GET /api/availability ────────────────────────────────
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        let availability = await Availability.findOne({ user: userId });

        if (!availability) {
            // First time — create default availability for this user
            availability = await Availability.create({
                user: userId,
                timezone: "Asia/Kolkata",
                weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
            });
        } else {
            // Ensure all 7 days exist (normalize in case schema changed)
            const normalized = normalizeWeeklyAvailability(
                availability.weeklyAvailability
            );

            const hasChanged =
                JSON.stringify(availability.weeklyAvailability) !==
                JSON.stringify(normalized);

            if (hasChanged) {
                availability.weeklyAvailability = normalized;
                await availability.save();
            }

            // Fix: fallback timezone if somehow empty in DB
            if (!availability.timezone) {
                availability.timezone = "Asia/Kolkata";
                await availability.save();
            }
        }

        return NextResponse.json(
            {
                availability: {
                    ...availability.toObject(),
                    weeklyAvailability: normalizeWeeklyAvailability(
                        availability.weeklyAvailability
                    ),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/availability error:", error);
        return NextResponse.json(
            { error: "Failed to fetch availability" },
            { status: 500 }
        );
    }
}

// ── POST /api/availability ───────────────────────────────
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        // Fix: validate timezone is a real IANA timezone
        const timezone = String(body.timezone || "Asia/Kolkata").trim();
        if (!isValidTimezone(timezone)) {
            return NextResponse.json(
                { error: "Invalid timezone selected" },
                { status: 400 }
            );
        }

        const weeklyAvailability = normalizeWeeklyAvailability(
            body.weeklyAvailability || []
        );

        const validationError = validateWeeklyAvailability(weeklyAvailability);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const availability = await Availability.findOneAndUpdate(
            { user: userId },
            { user: userId, timezone, weeklyAvailability },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(
            {
                message: "Availability saved successfully",
                availability: {
                    ...availability.toObject(),
                    weeklyAvailability: normalizeWeeklyAvailability(
                        availability.weeklyAvailability
                    ),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/availability error:", error);

        if (error?.name === "ValidationError") {
            return NextResponse.json(
                { error: "Please check the submitted availability" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to save availability" },
            { status: 500 }
        );
    }
}