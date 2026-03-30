// app/api/public/[username]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import EventType from "@/models/EventType";

export async function GET(req, { params }) {
    try {
        // ── Fix: await params (Next.js 15/16) ──
        const { username } = await params;

        await dbConnect();

        const user = await User.findOne({ username })
            .select("name username image")
            .lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ── Correct field is "owner" (matches EventType schema) ──
        const events = await EventType.find({
            owner: user._id,
            isActive: true,
        })
            .select("title slug description duration color location questions")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            { host: user, events },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/public/[username] error:", error);
        return NextResponse.json(
            { error: "Failed to load public profile" },
            { status: 500 }
        );
    }
}