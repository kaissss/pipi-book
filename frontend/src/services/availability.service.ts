import apiClient from "./api-client";
import type { AvailabilitySlot, AvailabilityPattern } from "@/types";

export interface CreateSlotPayload {
  startTime: string;
  endTime: string;
  serviceId?: string;
  recurrenceRule?: string;
}

export interface BulkCreateSlotsPayload {
  slots: CreateSlotPayload[];
}

export const availabilityService = {
  async getCoachAvailability(
    coachId: string,
    from: string,
    to: string
  ): Promise<AvailabilitySlot[]> {
    const { data } = await apiClient.get<AvailabilitySlot[]>(
      `/coaches/${coachId}/availability`,
      { params: { from, to } }
    );
    return data;
  },

  async getMySlots(from: string, to: string): Promise<AvailabilitySlot[]> {
    const { data } = await apiClient.get<AvailabilitySlot[]>("/coaches/me/slots", {
      params: { from, to },
    });
    return data;
  },

  async createSlot(payload: CreateSlotPayload): Promise<AvailabilitySlot> {
    const { data } = await apiClient.post<AvailabilitySlot>("/coaches/me/slots", payload);
    return data;
  },

  async bulkCreateSlots(payload: BulkCreateSlotsPayload): Promise<AvailabilitySlot[]> {
    const { data } = await apiClient.post<AvailabilitySlot[]>("/coaches/me/slots/bulk", payload);
    return data;
  },

  async deleteSlot(slotId: string): Promise<void> {
    await apiClient.delete(`/coaches/me/slots/${slotId}`);
  },

  async blockSlot(slotId: string): Promise<AvailabilitySlot> {
    const { data } = await apiClient.patch<AvailabilitySlot>(
      `/coaches/me/slots/${slotId}/block`
    );
    return data;
  },

  async getPatterns(): Promise<AvailabilityPattern[]> {
    const { data } = await apiClient.get<AvailabilityPattern[]>("/coaches/me/patterns");
    return data;
  },

  async savePattern(pattern: AvailabilityPattern): Promise<AvailabilityPattern> {
    const { data } = await apiClient.post<AvailabilityPattern>("/coaches/me/patterns", pattern);
    return data;
  },
};
