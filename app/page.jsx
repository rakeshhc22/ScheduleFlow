// app/page.jsx  ← Server Component (no "use client")
import LandingClient from "./LandingClient";

export const metadata = {
    title: "ScheduleFlow — Smart Scheduling for Busy People",
    description:
        "Book meetings without back-and-forth emails. Share your link, let others pick a time that works.",
};

export default function LandingPage() {
    return <LandingClient />;
}