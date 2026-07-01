"use client";

import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation, LOCALES, LOCALE_LABELS } from "@/i18n";

interface LanguageSwitcherProps {
  // "icon" = compact globe dropdown (desktop navbar).
  // "inline" = a labelled row of buttons (mobile menu).
  variant?: "icon" | "inline";
}

export default function LanguageSwitcher({ variant = "icon" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">{t("common.language.label")}</p>
        <div className="flex gap-2">
          {LOCALES.map((option) => (
            <button
              key={option}
              onClick={() => setLocale(option)}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                option === locale
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("common.language.label")}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setLocale(option)}
            className="flex items-center justify-between gap-4"
          >
            {LOCALE_LABELS[option]}
            {option === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
