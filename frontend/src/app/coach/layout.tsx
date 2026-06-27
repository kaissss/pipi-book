"use client";

import { LayoutDashboard, Calendar, Briefcase, CalendarDays, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import type { NavItem } from "@/components/layout/Sidebar";

const COACH_NAV: NavItem[] = [
  { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
  { label: "Schedule", href: "/coach/schedule", icon: Calendar },
  { label: "Services", href: "/coach/services", icon: Briefcase },
  { label: "Bookings", href: "/coach/bookings", icon: CalendarDays },
  { label: "Profile", href: "/coach/profile", icon: User },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar items={COACH_NAV} title="Coach Portal" />
        <main className="flex-1 p-4 md:p-8 max-w-5xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
