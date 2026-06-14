import apiClient from "./api-client";
import type { PaginatedResponse, PlatformStats, User, Coach, Booking } from "@/types";

export interface AdminUserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminCoachFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  async getStats(): Promise<PlatformStats> {
    const { data } = await apiClient.get<PlatformStats>("/admin/stats");
    return data;
  },

  async getUsers(filters: AdminUserFilters = {}): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<PaginatedResponse<User>>("/admin/users", {
      params: filters,
    });
    return data;
  },

  async getUser(id: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/admin/users/${id}`);
    return data;
  },

  async suspendUser(id: string): Promise<User> {
    const { data } = await apiClient.patch<User>(`/admin/users/${id}/suspend`);
    return data;
  },

  async activateUser(id: string): Promise<User> {
    const { data } = await apiClient.patch<User>(`/admin/users/${id}/activate`);
    return data;
  },

  async getCoaches(filters: AdminCoachFilters = {}): Promise<PaginatedResponse<Coach>> {
    const { data } = await apiClient.get<PaginatedResponse<Coach>>("/admin/coaches", {
      params: filters,
    });
    return data;
  },

  async approveCoach(id: string): Promise<Coach> {
    const { data } = await apiClient.patch<Coach>(`/admin/coaches/${id}/approve`);
    return data;
  },

  async rejectCoach(id: string, reason: string): Promise<Coach> {
    const { data } = await apiClient.patch<Coach>(`/admin/coaches/${id}/reject`, { reason });
    return data;
  },

  async suspendCoach(id: string): Promise<Coach> {
    const { data } = await apiClient.patch<Coach>(`/admin/coaches/${id}/suspend`);
    return data;
  },

  async getRecentBookings(limit = 10): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>("/admin/bookings/recent", {
      params: { limit },
    });
    return data;
  },
};
