"use client";

import { LayoutDashboard, Users, UserCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import type { NavItem } from "@/components/layout/Sidebar";
import { useTranslation } from "@/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const adminNav: NavItem[] = [
    { label: t("common.portalNav.dashboard"), href: "/admin/dashboard", icon: LayoutDashboard },
    { label: t("common.portalNav.users"), href: "/admin/users", icon: Users },
    { label: t("common.portalNav.coaches"), href: "/admin/coaches", icon: UserCheck },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar items={adminNav} title={t("common.portal.admin")} />
        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
