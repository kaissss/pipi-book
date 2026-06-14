"use client";

import { LayoutDashboard, CalendarDays, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import type { NavItem } from "@/components/layout/Sidebar";

const MEMBER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", href: "/member/bookings", icon: CalendarDays },
  { label: "Profile", href: "/member/profile", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar items={MEMBER_NAV} title="Member" />
        <main className="flex-1 p-6 md:p-8 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
