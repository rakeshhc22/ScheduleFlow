// app/api/ai/suggest/route.js
// POST → Use Claude (Anthropic) to suggest optimal meeting times
//        based on availability patterns and preferences

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { prompt, duration, preferredDays } = await request.json();

        // ── Gather context for AI ────────────────────────────
        const availability = await Availability.findOne({
            userId: session.user.id,
        }).lean();

        // Get recent bookings to understand patterns
        const recentBookings = await Booking.find({
            hostId: session.user.id,
            startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: "confirmed",
        })
            .select("startTime endTime")
            .sort({ startTime: -1 })
            .limit(20)
            .lean();

        // Build AI context payload
        const availabilityContext = availability?.weeklySchedule
            ?.filter(d => d.isActive)
            ?.map(d => `${d.dayName}: ${d.slots.map(s => `${s.start}–${s.end}`).join(", ")}`)
            ?.join("\n") || "No availability set";

        const bookingPatterns = recentBookings.length
            ? `Recent bookings peak at: ${getMostCommonHour(recentBookings)}`
            : "No recent booking history";

        // ── Call Claude API ──────────────────────────────────
        const message = await anthropic.messages.create({
            model: "claude-opus-4-5",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `You are a scheduling assistant for ScheduleFlow, a Calendly-like app.

User's availability:
${availabilityContext}

Booking patterns: ${bookingPatterns}
Preferred meeting duration: ${duration || 30} minutes
Preferred days: ${preferredDays?.join(", ") || "Any available day"}
User's request: ${prompt || "Suggest optimal meeting times for this week"}
Timezone: ${availability?.timezone || "UTC"}

Please suggest 3 optimal meeting time slots for this week. 
For each slot provide:
1. Day and time (in user's timezone)
2. Brief reason why this time is optimal
3. Predicted availability score (High/Medium/Low)

Format your response as JSON array: 
[{ "day": "Monday", "time": "10:00 AM", "reason": "...", "score": "High" }]
Only respond with the JSON array, no other text.`,
                },
            ],
        });

        // ── Parse AI response ────────────────────────────────
        const rawText = message.content[0].text.trim();
        let suggestions = [];
        try {
            suggestions = JSON.parse(rawText);
        } catch {
            // If parsing fails, return raw text
            return NextResponse.json({ suggestions: [], rawResponse: rawText });
        }

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("[AI_SUGGEST]", error);
        return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
    }
}

// ── Helper: find most common booking hour ────────────────
function getMostCommonHour(bookings) {
    const hours = bookings.map(b => new Date(b.startTime).getHours());
    const freq = hours.reduce((acc, h) => ({ ...acc, [h]: (acc[h] || 0) + 1 }), {});
    const peak = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (!peak) return "unknown";
    const h = parseInt(peak[0]);
    return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
}