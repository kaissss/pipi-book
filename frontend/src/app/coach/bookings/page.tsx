"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "@/components/booking/BookingCard";
import { usePiPiBookings, useConfirmBooking, useCancelBooking } from "@/hooks/useBooking";

export default function PiPiBookingsPage() {
  const [pendingPage, setPendingPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const { data: pending, isLoading: loadingPending } = usePiPiBookings({
    status: "PENDING",
    page: pendingPage,
    limit: 10,
  });
  const { data: upcoming, isLoading: loadingUpcoming } = usePiPiBookings({
    status: "CONFIRMED",
    page: upcomingPage,
    limit: 10,
  });
  const { data: past, isLoading: loadingPast } = usePiPiBookings({
    status: "COMPLETED",
    page: pastPage,
    limit: 10,
  });

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  function BookingList({
    data,
    isLoading,
    showConfirm,
  }: {
    data: typeof pending;
    isLoading: boolean;
    showConfirm?: boolean;
  }) {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      );
    }
    if (!data || data.data.length === 0) {
      return <p className="text-center py-8 text-muted-foreground text-sm">No bookings here.</p>;
    }
    return (
      <div className="space-y-3">
        {data.data.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            perspective="coach"
            onConfirm={showConfirm ? (id) => confirmBooking.mutate(id) : undefined}
            onCancel={(id) => cancelBooking.mutate({ id })}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your client sessions.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pending?.total ? `(${pending.total})` : ""}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <BookingList data={pending} isLoading={loadingPending} showConfirm />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <BookingList data={upcoming} isLoading={loadingUpcoming} />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <BookingList data={past} isLoading={loadingPast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
