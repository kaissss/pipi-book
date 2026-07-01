"use client";

import { LayoutDashboard, CalendarDays, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import type { NavItem } from "@/components/layout/Sidebar";
import { useTranslation } from "@/i18n";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const memberNav: NavItem[] = [
    { label: t("common.portalNav.dashboard"), href: "/member/dashboard", icon: LayoutDashboard },
    { label: t("common.portalNav.myBookings"), href: "/member/bookings", icon: CalendarDays },
    { label: t("common.portalNav.profile"), href: "/member/profile", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar items={memberNav} title={t("common.portal.member")} />
        <main className="flex-1 p-4 md:p-8 max-w-5xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
