"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, type AdminUserFilters, type AdminCoachFilters } from "@/services/admin.service";
import { QUERY_KEYS } from "@/lib/constants";

export function useAdminStats() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_STATS,
    queryFn: adminService.getStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_USERS, filters],
    queryFn: () => adminService.getUsers(filters),
    staleTime: 60 * 1000,
  });
}

export function useAdminCoaches(filters: AdminCoachFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_COACHES, filters],
    queryFn: () => adminService.getCoaches(filters),
    staleTime: 60 * 1000,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ["admin", "bookings", "recent"],
    queryFn: () => adminService.getRecentBookings(10),
    staleTime: 60 * 1000,
  });
}

export function useApproveCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveCoach(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_COACHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_STATS });
    },
  });
}

export function useRejectCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectCoach(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_COACHES });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
  });
}
