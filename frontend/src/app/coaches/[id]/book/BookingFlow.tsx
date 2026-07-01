"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useCoach } from "@/hooks/useCoach";
import { useCreateBooking } from "@/hooks/useBooking";
import { useInitPayment } from "@/hooks/usePayment";
import { useAuth } from "@/hooks/useAuth";
import ServiceSelector from "@/components/booking/ServiceSelector";
import BookingCalendar from "@/components/booking/BookingCalendar";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { Service, AvailabilitySlot, PaymentMethod } from "@/types";

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1, labelKey: "booking.flow.steps.service" },
  { id: 2, labelKey: "booking.flow.steps.schedule" },
  { id: 3, labelKey: "booking.flow.steps.confirm" },
];

interface Props {
  coachId: string;
}

export default function BookingFlow({ coachId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: coach, isLoading } = useCoach(coachId);

  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");

  const createBooking = useCreateBooking();
  const initPayment = useInitPayment();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">{t("booking.flow.signInPrompt")}</p>
        <Button asChild>
          <Link href={`/auth/login?redirect=/coaches/${coachId}/book`}>{t("booking.flow.loginWithLine")}</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("booking.flow.coachNotFound")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/coaches">{t("booking.flow.browseCoaches")}</Link>
        </Button>
      </div>
    );
  }

  async function handleConfirm() {
    if (!selectedService || !selectedSlot) return;

    const booking = await createBooking.mutateAsync({
      coachId,
      serviceId: selectedService.id,
      slotId: selectedSlot.id,
      notes: notes || undefined,
    });

    await initPayment.mutateAsync({
      bookingId: booking.id,
      method: paymentMethod,
      returnUrl: `${window.location.origin}/member/bookings`,
    });

    // Card payments redirect to ECPay (handled in the mutation). Cash has no
    // redirect, so send the user to their bookings to await coach confirmation.
    if (paymentMethod === "CASH") {
      router.push("/member/bookings");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/coaches/${coachId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("booking.flow.backToProfile")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("booking.flow.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("booking.flow.withCoach", { name: coach.user.displayName })}</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
              step > s.id
                ? "bg-primary text-primary-foreground"
                : step === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {s.id}
            </div>
            <span className={cn(
              "text-sm",
              step === s.id ? "font-medium" : "text-muted-foreground"
            )}>
              {t(s.labelKey)}
            </span>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("booking.flow.selectService")}</h2>
          <ServiceSelector
            services={coach.services}
            selectedServiceId={selectedService?.id ?? null}
            onSelect={(s) => setSelectedService(s)}
          />
          <Button
            className="w-full"
            disabled={!selectedService}
            onClick={() => setStep(2)}
          >
            {t("booking.flow.continueToSchedule")}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("booking.flow.pickTimeSlot")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              {t("booking.flow.changeService")}
            </Button>
          </div>
          <BookingCalendar
            coachId={coachId}
            selectedSlotId={selectedSlot?.id ?? null}
            onSlotSelect={(slot) => setSelectedSlot(slot)}
            serviceDurationMinutes={selectedService?.durationMinutes}
          />
          <Button
            className="w-full"
            disabled={!selectedSlot}
            onClick={() => setStep(3)}
          >
            {t("booking.flow.continueToConfirmation")}
          </Button>
        </div>
      )}

      {step === 3 && selectedService && selectedSlot && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("booking.flow.confirmAndPay")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              {t("booking.flow.changeSlot")}
            </Button>
          </div>
          <BookingConfirmation
            coach={coach}
            service={selectedService}
            slot={selectedSlot}
            notes={notes}
            onNotesChange={setNotes}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onConfirm={handleConfirm}
            isLoading={createBooking.isPending || initPayment.isPending}
          />
          {(createBooking.error || initPayment.error) && (
            <p className="text-sm text-destructive text-center">
              {t("booking.flow.somethingWentWrong")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
