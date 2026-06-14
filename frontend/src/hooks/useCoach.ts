"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coachService, type UpdateCoachProfilePayload } from "@/services/coach.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CoachFilters, Service } from "@/types";

export function useCoaches(filters: CoachFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COACHES, filters],
    queryFn: () => coachService.listCoaches(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCoach(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COACH(id),
    queryFn: () => coachService.getCoach(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCoachServices(coachId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COACH_SERVICES(coachId),
    queryFn: () => coachService.getCoachServices(coachId),
    enabled: !!coachId,
  });
}

export function useMyCoachProfile() {
  return useQuery({
    queryKey: ["coach", "me"],
    queryFn: coachService.getMyCoachProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCoachProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCoachProfilePayload) =>
      coachService.updateMyCoachProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["coach", "me"], updated);
    },
  });
}

export function useCoachServices_Manage() {
  const queryClient = useQueryClient();

  const createService = useMutation({
    mutationFn: (payload: Omit<Service, "id" | "coachId" | "createdAt" | "updatedAt">) =>
      coachService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "me"] });
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Service> }) =>
      coachService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "me"] });
    },
  });

  const deleteService = useMutation({
    mutationFn: (id: string) => coachService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "me"] });
    },
  });

  return { createService, updateService, deleteService };
}
