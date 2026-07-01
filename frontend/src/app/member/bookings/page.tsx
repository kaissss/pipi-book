"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "@/components/booking/BookingCard";
import { useMyBookings, useCancelBooking } from "@/hooks/useBooking";
import { useInitPayment } from "@/hooks/usePayment";
import { useTranslation } from "@/i18n";
import type { BookingStatus } from "@/types";

export default function MemberBookingsPage() {
  const { t } = useTranslation();
  const statusOptions: { value: string; label: string }[] = [
    { value: "all", label: t("member.bookings.filterAll") },
    { value: "CONFIRMED", label: t("common.bookingStatus.CONFIRMED") },
    { value: "PENDING", label: t("common.bookingStatus.PENDING") },
    { value: "COMPLETED", label: t("common.bookingStatus.COMPLETED") },
    { value: "CANCELLED", label: t("common.bookingStatus.CANCELLED") },
  ];
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyBookings({
    status: status === "all" ? undefined : (status as BookingStatus),
    page,
    limit: 10,
  });
  const cancelBooking = useCancelBooking();
  const initPayment = useInitPayment();

  function handlePay(bookingId: string) {
    initPayment.mutate({
      bookingId,
      method: "CREDIT_CARD",
      returnUrl: `${window.location.origin}/member/bookings`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("member.bookings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("member.bookings.subtitle")}</p>
      </div>

      {/* Filter */}
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Results */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {data && data.data.length === 0 && (
        <p className="text-center py-12 text-muted-foreground">{t("member.bookings.empty")}</p>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              perspective="student"
              onCancel={(id) => cancelBooking.mutate({ id })}
              onPay={handlePay}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("member.bookings.previous")}
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <button
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.totalPages}
          >
            {t("member.bookings.next")}
          </button>
        </div>
      )}
    </div>
  );
}
