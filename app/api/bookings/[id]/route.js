import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

function getSessionUserId(session) {
    return (
        session?.user?.id ||
        session?.user?._id ||
        session?.user?.userId ||
        null
    );
}

// ── GET /api/bookings/[id] ───────────────────────────────
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fix: await params for Next.js 15
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }

        await dbConnect();

        // Fix: use correct schema field "host" not "user"
        const booking = await Booking.findOne({ _id: id, host: userId })
            .populate("eventType", "title duration color location")
            .lean();

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ booking }, { status: 200 });
    } catch (error) {
        console.error("GET /api/bookings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

// ── PUT /api/bookings/[id] — cancel a booking ────────────
// Calendly pattern: bookings are cancelled, not edited
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fix: await params for Next.js 15
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }

        await dbConnect();

        const body = await req.json();
        const { action, cancelReason } = body;

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 });
        }

        if (action !== "cancel") {
            return NextResponse.json(
                { error: "Invalid action. Only 'cancel' is supported." },
                { status: 400 }
            );
        }

        // Fix: use correct schema field "host" not "user"
        const booking = await Booking.findOne({ _id: id, host: userId });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (booking.status === "cancelled") {
            return NextResponse.json(
                { error: "Booking is already cancelled" },
                { status: 400 }
            );
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancelReason = String(cancelReason || "").trim();
        await booking.save();

        return NextResponse.json(
            { message: "Booking cancelled successfully", booking },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/bookings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}

// ── DELETE /api/bookings/[id] — hard delete ──────────────
// Only allowed for past or already-cancelled bookings
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fix: await params for Next.js 15
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }

        await dbConnect();

        // Fix: use correct schema field "host" not "user"
        const booking = await Booking.findOne({ _id: id, host: userId });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Guard: don't allow hard-deleting upcoming confirmed bookings
        if (
            booking.status === "confirmed" &&
            new Date(booking.startTime) > new Date()
        ) {
            return NextResponse.json(
                { error: "Cannot delete an upcoming confirmed booking. Cancel it first." },
                { status: 400 }
            );
        }

        await Booking.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "Booking deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/bookings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete booking" },
            { status: 500 }
        );
    }
}