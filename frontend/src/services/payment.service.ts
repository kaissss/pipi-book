import apiClient from "./api-client";
import type { Payment, PaymentInitPayload, PaymentInitResponse } from "@/types";

export const paymentService = {
  async initPayment(payload: PaymentInitPayload): Promise<PaymentInitResponse> {
    const { data } = await apiClient.post<PaymentInitResponse>("/payments/init", payload);
    return data;
  },

  async getPayment(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}`);
    return data;
  },

  async getPaymentByBooking(bookingId: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/booking/${bookingId}`);
    return data;
  },

  async requestRefund(paymentId: string, reason: string): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, { reason });
    return data;
  },

  async verifyEcpayCallback(params: Record<string, string>): Promise<Payment> {
    const { data } = await apiClient.post<Payment>("/payments/ecpay/callback", params);
    return data;
  },
};
