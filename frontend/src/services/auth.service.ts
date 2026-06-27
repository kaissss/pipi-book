import apiClient from "./api-client";
import type { AuthResponse, User } from "@/types";

export interface LineCallbackPayload {
  code: string;
  state: string;
}

export const authService = {
  async lineCallback(payload: LineCallbackPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/line/callback", payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  // Backend returns only a fresh access token (the refresh token is unchanged).
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const { data } = await apiClient.post<{ accessToken: string; expiresIn: number }>(
      "/auth/refresh",
      { refreshToken }
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async updateProfile(payload: Partial<Pick<User, "displayName" | "email" | "phone">>): Promise<User> {
    const { data } = await apiClient.patch<User>("/auth/me", payload);
    return data;
  },
};
