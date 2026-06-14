"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  getAccessToken,
  clearTokens,
  setTokens,
  setStoredUser,
  getStoredUser,
} from "@/lib/auth";
import { QUERY_KEYS } from "@/lib/constants";
import type { User } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: authService.getMe,
    enabled: !!getAccessToken(),
    initialData: getStoredUser() ?? undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearTokens();
      queryClient.clear();
      router.push("/auth/login");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser: User) => {
      setStoredUser(updatedUser);
      queryClient.setQueryData(QUERY_KEYS.ME, updatedUser);
    },
  });

  function logout() {
    logoutMutation.mutate();
  }

  const isAuthenticated = !!user && !!getAccessToken();
  const isCoach = user?.role === "COACH";
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isCoach,
    isAdmin,
    isStudent,
    logout,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
  };
}

export function useLineCallback() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.lineCallback,
    onSuccess: (data) => {
      setTokens(data.tokens);
      setStoredUser(data.user);
      queryClient.setQueryData(QUERY_KEYS.ME, data.user);

      switch (data.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "COACH":
          router.push("/coach/dashboard");
          break;
        default:
          router.push("/member/dashboard");
      }
    },
  });
}
