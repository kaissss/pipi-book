"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/i18n";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <BookOpen className="h-5 w-5" />
              {APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("common.footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("common.footer.platform")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/coaches" className="hover:text-foreground transition-colors">{t("common.nav.findCoaches")}</Link></li>
              <li><Link href="/member/become-coach" className="hover:text-foreground transition-colors">{t("common.nav.becomeCoach")}</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">{t("common.footer.howItWorks")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">{t("common.footer.support")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">{t("common.footer.helpCenter")}</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">{t("common.footer.privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">{t("common.footer.terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>{t("common.footer.rights", { year: new Date().getFullYear(), app: APP_NAME })}</p>
          <p>{t("common.footer.poweredBy")}</p>
        </div>
      </div>
    </footer>
  );
}
