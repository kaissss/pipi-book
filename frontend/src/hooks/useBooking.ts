"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService, type BookingFilters } from "@/services/booking.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateBookingPayload } from "@/types";

export function useMyBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MEMBER_BOOKINGS, filters],
    queryFn: () => bookingService.getMyBookings(filters),
    staleTime: 60 * 1000,
  });
}

export function usePiPiBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COACH_BOOKINGS, filters],
    queryFn: () => bookingService.getPiPiBookings(filters),
    staleTime: 60 * 1000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKING(id),
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_BOOKINGS });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingService.cancelBooking(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_BOOKINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COACH_BOOKINGS });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.confirmBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COACH_BOOKINGS });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.completeBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COACH_BOOKINGS });
    },
  });
}
