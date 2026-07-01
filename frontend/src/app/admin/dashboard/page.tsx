"use client";

import { Users, UserCheck, CalendarDays, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/admin/StatsCard";
import RecentBookings from "@/components/admin/RecentBookings";
import { useAdminStats } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={t("admin.dashboard.totalUsers")}
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description={t("admin.dashboard.activeUsers", { n: stats.activeUsers })}
          />
          <StatsCard
            title={t("admin.dashboard.approvedCoaches")}
            value={stats.totalCoaches.toLocaleString()}
            icon={UserCheck}
            description={t("admin.dashboard.pendingApproval", { n: stats.pendingCoachApprovals })}
          />
          <StatsCard
            title={t("admin.dashboard.totalBookings")}
            value={stats.totalBookings.toLocaleString()}
            icon={CalendarDays}
            description={t("admin.dashboard.bookingsThisMonth", { n: stats.bookingsThisMonth })}
          />
          <StatsCard
            title={t("admin.dashboard.totalRevenue")}
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            description={t("admin.dashboard.revenueThisMonth", { amount: formatCurrency(stats.revenueThisMonth) })}
          />
          <StatsCard
            title={t("admin.dashboard.pendingApprovals")}
            value={stats.pendingCoachApprovals}
            icon={Clock}
            className="col-span-2"
          />
          <StatsCard
            title={t("admin.dashboard.monthlyBookings")}
            value={stats.bookingsThisMonth}
            icon={TrendingUp}
            className="col-span-2"
          />
        </div>
      ) : null}

      {/* Recent bookings */}
      <RecentBookings />
    </div>
  );
}
