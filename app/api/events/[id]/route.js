import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import EventType from "@/models/EventType";
import mongoose from "mongoose";

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

function buildUpdatePayload(body = {}) {
    const payload = {};

    if ("title" in body) payload.title = String(body.title || "").trim();
    if ("slug" in body) payload.slug = slugify(String(body.slug || "").trim());
    if ("description" in body)
        payload.description = String(body.description || "").trim();
    if ("location" in body)
        payload.location = String(body.location || "").trim();
    if ("color" in body) payload.color = String(body.color || "").trim();
    if ("duration" in body) payload.duration = Number(body.duration);

    // Fix: strictly parse boolean
    if ("isActive" in body) {
        payload.isActive =
            body.isActive === false || body.isActive === "false" ? false : true;
    }

    if ("questions" in body) payload.questions = sanitizeQuestions(body.questions);

    return payload;
}

function validateUpdatePayload(payload) {
    if ("title" in payload && !payload.title) return "Title is required";
    if ("slug" in payload && !payload.slug) return "Slug is required";
    if (
        "duration" in payload &&
        !ALLOWED_DURATIONS.includes(payload.duration)
    )
        return "Invalid duration selected";
    return null;
}

// ── GET /api/events/[id] ─────────────────────────────────
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Next.js 15: params is a Promise
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
        }

        await dbConnect();

        const event = await EventType.findOne({ _id: id, owner: userId }).lean();

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event }, { status: 200 });
    } catch (error) {
        console.error("GET /api/events/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch event" },
            { status: 500 }
        );
    }
}

// ── PUT /api/events/[id] ─────────────────────────────────
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Next.js 15: params is a Promise
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
        }

        await dbConnect();

        const body = await req.json();
        const payload = buildUpdatePayload(body);
        const validationError = validateUpdatePayload(payload);

        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Check slug uniqueness (exclude current event)
        if (payload.slug) {
            const existing = await EventType.findOne({
                owner: userId,
                slug: payload.slug,
                _id: { $ne: id },
            });

            if (existing) {
                return NextResponse.json(
                    { error: "Another event already uses this slug" },
                    { status: 409 }
                );
            }
        }

        const event = await EventType.findOneAndUpdate(
            { _id: id, owner: userId },
            payload,
            { new: true, runValidators: true }
        ).lean();

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/events/[id] error:", error);

        if (error?.name === "ValidationError") {
            return NextResponse.json(
                { error: "Please check the updated event details" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update event" },
            { status: 500 }
        );
    }
}

// ── DELETE /api/events/[id] ──────────────────────────────
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Next.js 15: params is a Promise
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
        }

        await dbConnect();

        const event = await EventType.findOneAndDelete({
            _id: id,
            owner: userId,
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Event deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/events/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete event" },
            { status: 500 }
        );
    }
}