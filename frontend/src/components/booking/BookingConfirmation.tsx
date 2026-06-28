"use client";

import { Calendar, Clock, CreditCard, User, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatDateTime, formatDuration, formatCurrency, getInitials } from "@/lib/utils";
import type { Coach, Service, AvailabilitySlot, PaymentMethod } from "@/types";

interface BookingConfirmationProps {
  coach: Coach;
  service: Service;
  slot: AvailabilitySlot;
  notes: string;
  onNotesChange: (notes: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; icon: typeof CreditCard }[] = [
  { id: "CREDIT_CARD", label: "Card", description: "Pay online now via ECPay", icon: CreditCard },
  { id: "CASH", label: "Cash", description: "Pay the coach in person", icon: Banknote },
];

export default function BookingConfirmation({
  coach,
  service,
  slot,
  notes,
  onNotesChange,
  paymentMethod,
  onPaymentMethodChange,
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

      {/* Payment method */}
      <div className="space-y-2">
        <Label>Payment method</Label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = paymentMethod === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPaymentMethodChange(option.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
              >
                <div className={cn("p-2 rounded-md shrink-0", selected ? "bg-primary/10" : "bg-muted")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
        {isLoading
          ? "Processing..."
          : paymentMethod === "CASH"
          ? "Confirm Booking"
          : "Confirm & Pay"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {paymentMethod === "CASH"
          ? "Your booking will be pending until the coach confirms it. Pay in person at your session."
          : "You will be redirected to ECPay to complete payment."}
      </p>
    </div>
  );
}
