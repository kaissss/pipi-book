"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService, type CreateSlotPayload } from "@/services/availability.service";
import { QUERY_KEYS } from "@/lib/constants";

export function useCoachAvailability(coachId: string, from: string, to: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COACH_AVAILABILITY(coachId, from, to),
    queryFn: () => availabilityService.getCoachAvailability(coachId, from, to),
    enabled: !!coachId && !!from && !!to,
    staleTime: 60 * 1000,
  });
}

export function useMySlots(from: string, to: string) {
  return useQuery({
    queryKey: ["coach", "slots", from, to],
    queryFn: () => availabilityService.getMySlots(from, to),
    enabled: !!from && !!to,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotPayload) => availabilityService.createSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "slots"] });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => availabilityService.deleteSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "slots"] });
    },
  });
}

export function useBlockSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => availabilityService.blockSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "slots"] });
    },
  });
}
