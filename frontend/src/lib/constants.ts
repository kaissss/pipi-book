export const APP_NAME = "PiPiBook";
export const APP_DESCRIPTION = "Find and book professional coaches — powered by LINE";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";
export const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID ?? "";
export const LINE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? "http://localhost:3000/auth/callback";

export const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
export const LINE_SCOPES = ["profile", "openid", "email"].join("%20");

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "cb_access_token",
  REFRESH_TOKEN: "cb_refresh_token",
  USER: "cb_user",
  LINE_STATE: "cb_line_state",
  ACTIVE_ROLE: "cb_active_role",
} as const;

export const QUERY_KEYS = {
  ME: ["me"],
  COACHES: ["coaches"],
  COACH: (id: string) => ["coaches", id],
  COACH_SERVICES: (id: string) => ["coaches", id, "services"],
  COACH_AVAILABILITY: (id: string, from: string, to: string) => [
    "coaches",
    id,
    "availability",
    from,
    to,
  ],
  BOOKINGS: ["bookings"],
  BOOKING: (id: string) => ["bookings", id],
  MEMBER_BOOKINGS: ["member", "bookings"],
  COACH_BOOKINGS: ["coach", "bookings"],
  ADMIN_STATS: ["admin", "stats"],
  ADMIN_USERS: ["admin", "users"],
  ADMIN_COACHES: ["admin", "coaches"],
} as const;

export const SPECIALTIES = [
  "Life Coaching",
  "Business Coaching",
  "Career Coaching",
  "Executive Coaching",
  "Health & Wellness",
  "Fitness",
  "Nutrition",
  "Mindfulness",
  "Relationship",
  "Financial",
  "Leadership",
  "Communication",
] as const;

export const LANGUAGES = ["English", "Chinese (Traditional)", "Chinese (Simplified)", "Japanese", "Korean"] as const;

// Status display labels now live in the i18n `common` namespace
// (common.bookingStatus.*, common.coachStatus.*) so they can be localized.

export const PAGINATION_LIMIT = 12;
