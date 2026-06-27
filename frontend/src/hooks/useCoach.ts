"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  coachService,
  type UpdateCoachProfilePayload,
  type CreateCoachProfilePayload,
} from "@/services/coach.service";
import { authService } from "@/services/auth.service";
import { getRefreshToken, setTokens, setStoredUser } from "@/lib/auth";
import { QUERY_KEYS } from "@/lib/constants";
import type { CoachFilters, Service } from "@/types";

/**
 * Become a coach. After the profile is created the user's role is COACH in the
 * database, but the JWT in the cookie still says STUDENT — so we refresh the
 * access token (which re-reads the role) before navigating into the coach
 * portal, otherwise the edge middleware would bounce the request back.
 */
export function useCreateCoachProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: CreateCoachProfilePayload) => {
      // Creation is the only step that may legitimately fail; once it succeeds
      // the profile + COACH role exist, so the follow-up steps are best-effort
      // and must not surface as "failed to create".
      await coachService.createCoachProfile(payload);

      // Refresh so the cookie JWT reflects the new COACH role (the edge
      // middleware reads it before /coach/* renders).
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { accessToken, expiresIn } = await authService.refreshToken(refreshToken);
          setTokens({ accessToken, expiresIn });
        } catch {
          /* token refresh hiccup — middleware will refresh on next request */
        }
      }

      try {
        const user = await authService.getMe();
        setStoredUser(user);
        queryClient.setQueryData(QUERY_KEYS.ME, user);
      } catch {
        // Non-fatal: the profile was created; just drop the stale ME cache so
        // it refetches with the new role.
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      }
    },
    onSuccess: () => {
      router.push("/coach/dashboard");
    },
  });
}

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
