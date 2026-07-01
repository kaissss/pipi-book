"use client";

import { LayoutDashboard, Calendar, Briefcase, CalendarDays, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import type { NavItem } from "@/components/layout/Sidebar";
import { useTranslation } from "@/i18n";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const coachNav: NavItem[] = [
    { label: t("common.portalNav.dashboard"), href: "/coach/dashboard", icon: LayoutDashboard },
    { label: t("common.portalNav.schedule"), href: "/coach/schedule", icon: Calendar },
    { label: t("common.portalNav.services"), href: "/coach/services", icon: Briefcase },
    { label: t("common.portalNav.bookings"), href: "/coach/bookings", icon: CalendarDays },
    { label: t("common.portalNav.profile"), href: "/coach/profile", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar items={coachNav} title={t("common.portal.coach")} />
        <main className="flex-1 p-4 md:p-8 max-w-5xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
