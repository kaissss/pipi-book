"use client";

import { STORAGE_KEYS, LIFF_ID, LINE_AUTH_URL, LINE_CHANNEL_ID, LINE_REDIRECT_URI, LINE_SCOPES } from "./constants";
import type { AuthTokens, User } from "@/types";

// ─── Token Storage ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ─── User Storage ─────────────────────────────────────────────────────────────

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// ─── LINE OAuth ───────────────────────────────────────────────────────────────

export function generateState(): string {
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem(STORAGE_KEYS.LINE_STATE, state);
  return state;
}

export function getStoredState(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LINE_STATE);
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEYS.LINE_STATE);
}

export function buildLineAuthUrl(): string {
  const state = generateState();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINE_CHANNEL_ID,
    redirect_uri: LINE_REDIRECT_URI,
    state,
    scope: "profile openid email",
  });
  return `${LINE_AUTH_URL}?${params.toString()}`;
}

// ─── LIFF ─────────────────────────────────────────────────────────────────────

let liffInitialized = false;

export async function initLiff(): Promise<void> {
  if (liffInitialized || !LIFF_ID) return;
  try {
    const liff = (await import("@line/liff")).default;
    await liff.init({ liffId: LIFF_ID });
    liffInitialized = true;
  } catch (err) {
    console.error("LIFF init failed:", err);
  }
}

export async function getLiffProfile() {
  try {
    const liff = (await import("@line/liff")).default;
    if (!liff.isLoggedIn()) return null;
    return liff.getProfile();
  } catch {
    return null;
  }
}

// ─── JWT helpers ──────────────────────────────────────────────────────────────

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now();
}
