// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
    try {
        await connectDB();

        const { name, email, password, username } = await request.json();

        // ── Validation ──────────────────────────────────────────────────────
        if (!name || !email || !password || !username) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { error: "Username can only contain lowercase letters, numbers, and hyphens" },
                { status: 400 }
            );
        }

        // ── Duplicate checks ────────────────────────────────────────────────
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 409 }
            );
        }

        // ── Create user ─────────────────────────────────────────────────────
        // Do NOT hash the password here manually.
        // The User model's pre("save") hook handles hashing automatically.
        // Hashing here AND in the model was causing double-hashing,
        // which made every login attempt fail with "invalid password".
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,                        // plain text — model will hash it
            username: username.toLowerCase(),
        });

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}