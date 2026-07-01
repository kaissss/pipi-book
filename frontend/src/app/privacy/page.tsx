"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/i18n";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">{t("legal.privacy.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("legal.privacy.lastUpdated", { date: t("legal.privacy.date") })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s1Title")}</h2>
            <p>{t("legal.privacy.s1Body", { app: APP_NAME })}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s2Title")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="text-foreground font-medium">{t("legal.privacy.s2Item1Label")}</span>{" "}
                {t("legal.privacy.s2Item1Body")}
              </li>
              <li>
                <span className="text-foreground font-medium">{t("legal.privacy.s2Item2Label")}</span>{" "}
                {t("legal.privacy.s2Item2Body")}
              </li>
              <li>
                <span className="text-foreground font-medium">{t("legal.privacy.s2Item3Label")}</span>{" "}
                {t("legal.privacy.s2Item3Body", { app: APP_NAME })}
              </li>
              <li>
                <span className="text-foreground font-medium">{t("legal.privacy.s2Item4Label")}</span>{" "}
                {t("legal.privacy.s2Item4Body")}
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s3Title")}</h2>
            <p>{t("legal.privacy.s3Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s4Title")}</h2>
            <p>{t("legal.privacy.s4Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s5Title")}</h2>
            <p>{t("legal.privacy.s5Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s6Title")}</h2>
            <p>{t("legal.privacy.s6Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s7Title")}</h2>
            <p>{t("legal.privacy.s7Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s8Title")}</h2>
            <p>{t("legal.privacy.s8Body")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t("legal.privacy.s9Title")}</h2>
            <p>{t("legal.privacy.s9Body")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
