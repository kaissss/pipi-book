// Supported languages for the app. Traditional Chinese ("zh-TW") targets the
// Taiwan / LINE / ECPay market; English is the fallback.
export const LOCALES = ["en", "zh-TW"] as const;

export type Locale = (typeof LOCALES)[number];

// Fallback when the browser language is neither Chinese nor English, and the
// language shown on the very first server render before the client resolves.
export const DEFAULT_LOCALE: Locale = "en";

// Human-readable names shown in the language switcher, each written in its own
// language so a user can recognise their language regardless of the current UI.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "zh-TW": "繁體中文",
};

// Where the chosen language is remembered. localStorage drives the client;
// the cookie lets the server (and future SSR) read the same choice.
export const LOCALE_STORAGE_KEY = "cb_locale";
export const LOCALE_COOKIE = "cb_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Map the browser's preferred languages onto a supported locale.
 * Any Chinese variant maps to Traditional Chinese (our only Chinese locale);
 * anything English-like maps to English; everything else falls back.
 */
export function matchBrowserLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const lower = language.toLowerCase();
    if (lower.startsWith("zh")) return "zh-TW";
    if (lower.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
