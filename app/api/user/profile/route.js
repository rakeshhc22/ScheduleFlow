import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

function getSessionUserId(session) {
    return (
        session?.user?.id ||
        session?.user?._id ||
        session?.user?.userId ||
        null
    );
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(userId)
            .select("name email username image")
            .lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("GET /api/user/profile error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        const userId = getSessionUserId(session);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const existingEmail = await User.findOne({
            email,
            _id: { $ne: userId },
        }).lean();

        if (existingEmail) {
            return NextResponse.json(
                { error: "Email is already in use" },
                { status: 409 }
            );
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        )
            .select("name email username image")
            .lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Profile updated successfully", user },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/user/profile error:", error);

        if (error?.name === "ValidationError") {
            return NextResponse.json(
                { error: "Please check the submitted profile details" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
