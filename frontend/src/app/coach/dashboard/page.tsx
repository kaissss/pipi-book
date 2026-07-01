"use client";

import { format } from "date-fns";
import { CalendarDays, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "@/components/booking/BookingCard";
import { useAuth } from "@/hooks/useAuth";
import { usePiPiBookings, useConfirmBooking } from "@/hooks/useBooking";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export default function CoachDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayBookings, isLoading } = usePiPiBookings({
    from: today,
    to: today,
    limit: 10,
  });
  const { data: confirmed } = usePiPiBookings({ status: "CONFIRMED", limit: 1 });
  const { data: pending } = usePiPiBookings({ status: "PENDING", limit: 1 });
  const confirmBooking = useConfirmBooking();

  const totalRevenue = todayBookings?.data
    .filter((b) => b.payment?.status === "PAID")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {t(greetingKey(), { name: user?.displayName?.split(" ")[0] ?? "" })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-md shrink-0">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{todayBookings?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("coachPortal.dashboard.todaysSessions")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-md shrink-0">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{pending?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("coachPortal.dashboard.pendingConfirm")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-md shrink-0">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">{t("coachPortal.dashboard.todaysRevenue")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-md shrink-0">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{confirmed?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("coachPortal.dashboard.upcomingConfirmed")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule */}
      <div>
        <h2 className="font-semibold text-lg mb-4">{t("coachPortal.dashboard.todaysSchedule")}</h2>
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        )}
        {todayBookings?.data.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("coachPortal.dashboard.noSessionsToday")}</p>
        )}
        {todayBookings && todayBookings.data.length > 0 && (
          <div className="space-y-3">
            {todayBookings.data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                perspective="coach"
                onConfirm={(id) => confirmBooking.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "coachPortal.dashboard.greetingMorning";
  if (hour < 17) return "coachPortal.dashboard.greetingAfternoon";
  return "coachPortal.dashboard.greetingEvening";
}
