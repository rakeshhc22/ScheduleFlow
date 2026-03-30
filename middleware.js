// middleware.js
// Protects dashboard routes — redirects unauthenticated users to /login

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Already authenticated — allow through
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // token = null if not logged in
        },
    }
);

// Apply middleware only to dashboard routes
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/event-types/:path*",
        "/availability/:path*",
        "/bookings/:path*",
        "/settings/:path*",
    ],
};