import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb-client";
import connectDB from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    // Use MongoDB adapter for session/account persistence
    adapter: MongoDBAdapter(clientPromise),

    providers: [
        // Google OAuth — stores accessToken so we can call Google Calendar API
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    // Request offline access so we get a refresh token
                    access_type: "offline",
                    prompt: "consent",
                    scope: [
                        "openid",
                        "email",
                        "profile",
                        "https://www.googleapis.com/auth/calendar",
                        "https://www.googleapis.com/auth/calendar.events",
                    ].join(" "),
                },
            },
        }),

        // Email/password credentials
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await connectDB();
                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user || !user.password) {
                    throw new Error("No account found with this email");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Incorrect password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    username: user.username,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        // Attach user id, username, and google access token to the JWT
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            if (account?.provider === "google") {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },

        // Expose id, username, and accessToken on the client-side session object
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.accessToken = token.accessToken;
                session.user.refreshToken = token.refreshToken;
            }
            return session;
        },

        // After Google sign-in, create or update the user record in our DB
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    await connectDB();
                    const existing = await User.findOne({ email: user.email });

                    if (!existing) {
                        const username = generateUsername(profile.name || user.email);
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            username,
                            googleId: profile.sub,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                        });
                    } else {
                        // Keep tokens fresh on every sign-in
                        await User.findByIdAndUpdate(existing._id, {
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                        });
                    }
                } catch (err) {
                    console.error("signIn callback error:", err);
                    return false;
                }
            }
            return true;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
};

// Helper: make a URL-safe username from a display name
function generateUsername(name) {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `${base}${suffix}`;
}