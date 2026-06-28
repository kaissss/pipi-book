"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";
import type { PaymentInitPayload } from "@/types";

export function useInitPayment() {
  return useMutation({
    mutationFn: (payload: PaymentInitPayload) => paymentService.initPayment(payload),
    onSuccess: (data) => {
      // ECPay has no single redirect URL — build a hidden form from the signed
      // params and POST it, which navigates the browser to ECPay's cashier.
      if (data.formUrl && data.params) {
        submitToEcpay(data.formUrl, data.params);
      }
    },
  });
}

function submitToEcpay(formUrl: string, params: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = formUrl;
  Object.entries(params).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
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
