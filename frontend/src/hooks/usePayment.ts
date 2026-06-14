"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";
import type { PaymentInitPayload } from "@/types";

export function useInitPayment() {
  return useMutation({
    mutationFn: (payload: PaymentInitPayload) => paymentService.initPayment(payload),
    onSuccess: (data) => {
      // Redirect to ECPay or LINE Pay checkout page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });
}

export function usePaymentByBooking(bookingId: string) {
  return useQuery({
    queryKey: ["payment", "booking", bookingId],
    queryFn: () => paymentService.getPaymentByBooking(bookingId),
    enabled: !!bookingId,
  });
}

export function useRequestRefund() {
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      paymentService.requestRefund(paymentId, reason),
  });
}
