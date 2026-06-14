"use client";

import { useRecentBookings } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatCurrency, getBookingStatusColor } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";

export default function RecentBookings() {
  const { data: bookings, isLoading } = useRecentBookings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {bookings && bookings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-sm">
                    {booking.student.displayName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.coach.user.displayName}
                  </TableCell>
                  <TableCell className="text-sm">{booking.service.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(booking.slot.startTime)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.payment ? formatCurrency(booking.payment.amount) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getBookingStatusColor(booking.status)}>
                      {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {bookings && bookings.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No recent bookings</p>
        )}
      </CardContent>
    </Card>
  );
}
