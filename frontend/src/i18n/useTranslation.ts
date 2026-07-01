"use client";

import { useContext } from "react";
import { I18nContext, type I18nContextValue } from "./I18nProvider";

/**
 * Access the current language and the translate function.
 *
 *   const { t, locale, setLocale } = useTranslation();
 *   t("common.nav.findCoaches");
 *   t("common.nav.switchTo", { role: t("common.roles.COACH") });
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within <I18nProvider>");
  }
  return context;
}
