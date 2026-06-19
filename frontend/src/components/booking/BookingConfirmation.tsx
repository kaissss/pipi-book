"use client";

import { Calendar, Clock, CreditCard, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime, formatDuration, formatCurrency, getInitials } from "@/lib/utils";
import type { Coach, Service, AvailabilitySlot } from "@/types";

interface BookingConfirmationProps {
  coach: Coach;
  service: Service;
  slot: AvailabilitySlot;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function BookingConfirmation({
  coach,
  service,
  slot,
  notes,
  onNotesChange,
  onConfirm,
  isLoading,
}: BookingConfirmationProps) {
  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Coach */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={coach.user.avatar} alt={coach.user.displayName} />
              <AvatarFallback>{getInitials(coach.user.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{coach.user.displayName}</p>
              <p className="text-xs text-muted-foreground">Coach</p>
            </div>
          </div>

          <Separator />

          {/* Service */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{service.name}</p>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </div>
          </div>

          {/* Date/time */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{formatDateTime(slot.startTime)}</p>
              <p className="text-xs text-muted-foreground">to {formatDateTime(slot.endTime)}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{formatDuration(service.durationMinutes)}</p>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Total</span>
            </div>
            <span className="font-bold text-lg">{formatCurrency(service.price)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes for coach (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any specific topics, goals, or things you want the coach to know..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Confirm button */}
      <Button
        className="w-full"
        size="lg"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Confirm & Pay"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        You will be redirected to ECPay to complete payment.
      </p>
    </div>
  );
}
