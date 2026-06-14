import apiClient from "./api-client";
import type { Booking, CreateBookingPayload, PaginatedResponse, BookingStatus } from "@/types";

export interface BookingFilters {
  status?: BookingStatus;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post<Booking>("/bookings", payload);
    return data;
  },

  async getBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },

  async getMyBookings(filters: BookingFilters = {}): Promise<PaginatedResponse<Booking>> {
    const { data } = await apiClient.get<PaginatedResponse<Booking>>("/bookings/me", {
      params: filters,
    });
    return data;
  },

  async getPiPiBookings(filters: BookingFilters = {}): Promise<PaginatedResponse<Booking>> {
    const { data } = await apiClient.get<PaginatedResponse<Booking>>("/bookings/coach", {
      params: filters,
    });
    return data;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/cancel`, { reason });
    return data;
  },

  async confirmBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/confirm`);
    return data;
  },

  async completeBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/complete`);
    return data;
  },

  async addMeetingUrl(id: string, meetingUrl: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/meeting`, { meetingUrl });
    return data;
  },
};
