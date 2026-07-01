"use client";

import Link from "next/link";
import { CalendarDays, Clock, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "@/components/booking/BookingCard";
import { useAuth } from "@/hooks/useAuth";
import { useMyBookings, useCancelBooking } from "@/hooks/useBooking";
import { useTranslation } from "@/i18n";

export default function MemberDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: upcoming, isLoading } = useMyBookings({ status: "CONFIRMED", limit: 3 });
  const { data: pending } = useMyBookings({ status: "PENDING", limit: 3 });
  const { data: completed } = useMyBookings({ status: "COMPLETED", limit: 1 });
  const cancelBooking = useCancelBooking();

  const upcomingCount = upcoming?.total ?? 0;
  const pendingCount = pending?.total ?? 0;
  const completedCount = completed?.total ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {t("member.dashboard.greeting", {
            name: user?.displayName?.split(" ")[0] ?? t("member.dashboard.fallbackName"),
          })}
        </h1>
        <p className="text-muted-foreground mt-1">{t("member.dashboard.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">{t("member.dashboard.upcomingSessions")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-md">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">{t("member.dashboard.pendingPayment")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">{t("member.dashboard.completed")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{t("member.dashboard.upcomingSectionTitle")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/member/bookings">{t("member.dashboard.viewAll")}</Link>
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        )}

        {upcoming?.data.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium mb-1">{t("member.dashboard.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("member.dashboard.emptyDescription")}
              </p>
              <Button asChild>
                <Link href="/coaches">{t("member.dashboard.findACoach")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {upcoming && upcoming.data.length > 0 && (
          <div className="space-y-3">
            {upcoming.data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                perspective="student"
                onCancel={(id) => cancelBooking.mutate({ id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
