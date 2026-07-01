"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/i18n";

export default function HelpPage() {
  const { t } = useTranslation();

  const faqGroups: { category: string; items: { q: string; a: string }[] }[] = [
    {
      category: t("legal.help.cat1"),
      items: [
        { q: t("legal.help.q1"), a: t("legal.help.a1") },
        { q: t("legal.help.q2"), a: t("legal.help.a2") },
      ],
    },
    {
      category: t("legal.help.cat2"),
      items: [
        { q: t("legal.help.q3"), a: t("legal.help.a3") },
        { q: t("legal.help.q4"), a: t("legal.help.a4") },
        { q: t("legal.help.q5"), a: t("legal.help.a5") },
        { q: t("legal.help.q6"), a: t("legal.help.a6") },
      ],
    },
    {
      category: t("legal.help.cat3"),
      items: [
        { q: t("legal.help.q7"), a: t("legal.help.a7") },
        { q: t("legal.help.q8"), a: t("legal.help.a8") },
      ],
    },
    {
      category: t("legal.help.cat4"),
      items: [
        { q: t("legal.help.q9"), a: t("legal.help.a9") },
        { q: t("legal.help.q10"), a: t("legal.help.a10") },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">{t("legal.help.title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {t("legal.help.subtitle", { app: APP_NAME })}
        </p>

        <div className="space-y-10">
          {faqGroups.map((group) => (
            <section key={group.category} className="space-y-4">
              <h2 className="text-lg font-semibold">{group.category}</h2>
              <dl className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.q} className="rounded-lg border p-4">
                    <dt className="font-medium text-sm">{item.q}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-muted/50 p-6 text-center">
          <p className="font-medium">{t("legal.help.stillNeedHelpTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("legal.help.stillNeedHelpLead")}{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              {t("legal.help.termsLink")}
            </Link>{" "}
            {t("legal.help.and")}{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              {t("legal.help.privacyLink")}
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
