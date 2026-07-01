"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/i18n";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">{t("legal.terms.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("legal.terms.lastUpdated", { date: t("legal.terms.date") })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s1Title")}</h2>
            <p>{t("legal.terms.s1Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s2Title")}</h2>
            <p>{t("legal.terms.s2Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s3Title")}</h2>
            <p>{t("legal.terms.s3Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s4Title")}</h2>
            <p>{t("legal.terms.s4Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s5Title")}</h2>
            <p>{t("legal.terms.s5Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s6Title")}</h2>
            <p>{t("legal.terms.s6Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s7Title")}</h2>
            <p>{t("legal.terms.s7Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s8Title")}</h2>
            <p>{t("legal.terms.s8Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.terms.s9Title")}</h2>
            <p>{t("legal.terms.s9Body", { app: APP_NAME })}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
