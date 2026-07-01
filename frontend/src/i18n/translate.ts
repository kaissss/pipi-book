import type { Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";
import { messages } from "./messages";

// Values interpolated into a message, e.g. t("booking.with", { name: "Amy" }).
export type TranslationVars = Record<string, string | number>;

// A message tree is arbitrarily nested objects bottoming out in strings.
type MessageNode = string | { [key: string]: MessageNode };

/** Walk a dotted key path ("nav.findCoaches") into a message tree. */
function lookup(tree: MessageNode | undefined, path: string): string | undefined {
  let current: MessageNode | undefined = tree;
  for (const segment of path.split(".")) {
    if (current === undefined || typeof current === "string") return undefined;
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

/** Replace {placeholder} tokens with the matching variable. */
function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Resolve a message for the given locale, falling back to English and finally
 * to the raw key so a missing translation is visible but never crashes the UI.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: TranslationVars,
): string {
  const template =
    lookup(messages[locale] as MessageNode, key) ??
    lookup(messages[DEFAULT_LOCALE] as MessageNode, key) ??
    key;

  if (process.env.NODE_ENV !== "production" && template === key) {
    // Surface missing keys during development without breaking the page.
    console.warn(`[i18n] Missing translation for "${key}" (${locale})`);
  }

  return interpolate(template, vars);
}
