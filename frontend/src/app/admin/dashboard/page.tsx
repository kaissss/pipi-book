"use client";

import { Users, UserCheck, CalendarDays, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/admin/StatsCard";
import RecentBookings from "@/components/admin/RecentBookings";
import { useAdminStats } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time stats across PiPiBook.</p>
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
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description={`${stats.activeUsers} active`}
          />
          <StatsCard
            title="Approved Coaches"
            value={stats.totalCoaches.toLocaleString()}
            icon={UserCheck}
            description={`${stats.pendingCoachApprovals} pending approval`}
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={CalendarDays}
            description={`${stats.bookingsThisMonth} this month`}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            description={`${formatCurrency(stats.revenueThisMonth)} this month`}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingCoachApprovals}
            icon={Clock}
            className="col-span-2"
          />
          <StatsCard
            title="Monthly Bookings"
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
