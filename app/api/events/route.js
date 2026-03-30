import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import EventType from "@/models/EventType";

const ALLOWED_DURATIONS = [15, 30, 45, 60, 90, 120];

function getSessionUserId(session) {
    return (
        session?.user?.id ||
        session?.user?._id ||
        session?.user?.userId ||
        null
    );
}

function slugify(value = "") {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

function sanitizeQuestions(questions) {
    if (!Array.isArray(questions)) return [];
    return questions
        .filter((q) => q && typeof q.label === "string" && q.label.trim())
        .map((q) => ({
            label: q.label.trim(),
            required: q.required === true,
        }));
}

function buildEventPayload(body = {}) {
    const title = String(body.title || "").trim();
    const incomingSlug = String(body.slug || "").trim();
    const slug = slugify(incomingSlug || title);
    const description = String(body.description || "").trim();
    const location = String(body.location || "Google Meet / Video Call").trim();
    const color = String(body.color || "#7c3aed").trim();
    const duration = Number(body.duration ?? 30);

    // Fix: strictly parse boolean — "false" string must not become true
    const isActive =
        body.isActive === false || body.isActive === "false" ? false : true;

    return {
        title,
        slug,
        description,
        location,
        color,
        duration,
        isActive,
        questions: sanitizeQuestions(body.questions),
    };
}

function validateEventPayload(payload) {
    if (!payload.title) return "Title is required";
    if (!payload.slug) return "Slug is required";
    if (!ALLOWED_DURATIONS.includes(payload.duration))
        return "Invalid duration selected";
    return null;
}

// ── GET /api/events ──────────────────────────────────────
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const events = await EventType.find({ owner: userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error("GET /api/events error:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

// ── POST /api/events ─────────────────────────────────────
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const payload = buildEventPayload(body);
        const validationError = validateEventPayload(payload);

        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const existing = await EventType.findOne({
            owner: userId,
            slug: payload.slug,
        });

        if (existing) {
            return NextResponse.json(
                { error: "An event with this slug already exists" },
                { status: 409 }
            );
        }

        const event = await EventType.create({ owner: userId, ...payload });

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        console.error("POST /api/events error:", error);

        if (error?.name === "ValidationError") {
            return NextResponse.json(
                { error: "Please check the submitted event details" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create event" },
            { status: 500 }
        );
    }
}