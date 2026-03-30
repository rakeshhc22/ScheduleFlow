import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
    title: {
        template: "%s | ScheduleFlow",
        default: "Dashboard | ScheduleFlow",
    },
    description: "Manage your schedule, events, and bookings.",
};

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
