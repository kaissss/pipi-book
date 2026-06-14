import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatDateTime,
  formatDuration,
  formatCurrency,
  getInitials,
  getBookingStatusColor,
} from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  perspective: "student" | "coach";
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
}

export default function BookingCard({
  booking,
  perspective,
  onCancel,
  onConfirm,
}: BookingCardProps) {
  const other = perspective === "student" ? booking.coach.user : booking.student;
  const label = perspective === "student" ? "Coach" : "Student";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Other party */}
          <div className="flex items-center gap-3 sm:w-48 shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={other.pictureUrl} alt={other.displayName} />
              <AvatarFallback>{getInitials(other.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{other.displayName}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{booking.service.name}</p>
              <Badge className={getBookingStatusColor(booking.status)}>
                {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(booking.slot.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(booking.service.durationMinutes)}
              </span>
            </div>
            {booking.payment && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(booking.payment.amount)} &middot; {booking.payment.status}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {booking.meetingUrl && booking.status === "CONFIRMED" && (
              <Button asChild size="sm" variant="outline">
                <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="h-3 w-3 mr-1" />
                  Join
                </a>
              </Button>
            )}
            {onConfirm && booking.status === "PENDING" && (
              <Button size="sm" onClick={() => onConfirm(booking.id)}>
                Confirm
              </Button>
            )}
            {onCancel && ["PENDING", "CONFIRMED"].includes(booking.status) && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
