// app/api/calendar/sync/route.js
// POST → exchange Google OAuth code for tokens and save to user
// GET  → return current Google Calendar connection status

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { exchangeCodeForTokens, listCalendars } from "@/lib/google-calendar";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id)
            .select("googleAccessToken googleCalendarId")
            .lean();

        return NextResponse.json({
            connected: !!user?.googleAccessToken,
            calendarId: user?.googleCalendarId || null,
        });
    } catch (error) {
        console.error("[CALENDAR_STATUS]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { code } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: "Authorization code is required" },
                { status: 400 }
            );
        }

        // ── Exchange code → access + refresh tokens ──────────
        const tokens = await exchangeCodeForTokens(code);

        // ── Fetch available calendars ────────────────────────
        const calendars = await listCalendars(tokens.access_token);
        const primaryCalendar = calendars.find(c => c.primary) || calendars[0];

        // ── Persist tokens to user document ─────────────────
        await User.findByIdAndUpdate(session.user.id, {
            $set: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleTokenExpiry: new Date(tokens.expiry_date),
                googleCalendarId: primaryCalendar?.id || "primary",
            },
        });

        return NextResponse.json({
            connected: true,
            calendarId: primaryCalendar?.id || "primary",
            calendars,
        });
    } catch (error) {
        console.error("[CALENDAR_SYNC]", error);
        return NextResponse.json({ error: "Failed to sync calendar" }, { status: 500 });
    }
}