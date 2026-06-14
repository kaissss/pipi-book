import apiClient from "./api-client";
import type { Coach, CoachFilters, PaginatedResponse, Service } from "@/types";

export interface UpdateCoachProfilePayload {
  bio?: string;
  specialties?: string[];
  experience?: number;
  timezone?: string;
  location?: string;
  languages?: string[];
  certifications?: string[];
}

export const coachService = {
  async listCoaches(filters: CoachFilters = {}): Promise<PaginatedResponse<Coach>> {
    const { data } = await apiClient.get<PaginatedResponse<Coach>>("/coaches", {
      params: filters,
    });
    return data;
  },

  async getCoach(id: string): Promise<Coach> {
    const { data } = await apiClient.get<Coach>(`/coaches/${id}`);
    return data;
  },

  async getCoachServices(coachId: string): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>(`/coaches/${coachId}/services`);
    return data;
  },

  async getMyCoachProfile(): Promise<Coach> {
    const { data } = await apiClient.get<Coach>("/coaches/me");
    return data;
  },

  async updateMyCoachProfile(payload: UpdateCoachProfilePayload): Promise<Coach> {
    const { data } = await apiClient.patch<Coach>("/coaches/me", payload);
    return data;
  },

  async createService(payload: Omit<Service, "id" | "coachId" | "createdAt" | "updatedAt">): Promise<Service> {
    const { data } = await apiClient.post<Service>("/coaches/me/services", payload);
    return data;
  },

  async updateService(serviceId: string, payload: Partial<Service>): Promise<Service> {
    const { data } = await apiClient.patch<Service>(`/coaches/me/services/${serviceId}`, payload);
    return data;
  },

  async deleteService(serviceId: string): Promise<void> {
    await apiClient.delete(`/coaches/me/services/${serviceId}`);
  },
};
