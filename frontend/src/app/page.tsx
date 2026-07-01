"use client";

import Link from "next/link";
import { ArrowRight, Star, Shield, Zap, Users, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/i18n";

// English specialty values double as the /coaches?specialty= filter value; the
// visible label is localized via home.specialties.labels.
const SPECIALTY_VALUES = [
  "Life Coaching",
  "Business",
  "Career",
  "Health & Wellness",
  "Fitness",
  "Mindfulness",
  "Leadership",
  "Financial",
] as const;

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: CalendarCheck,
      title: t("home.features.schedulingTitle"),
      description: t("home.features.schedulingDesc"),
    },
    {
      icon: Shield,
      title: t("home.features.paymentsTitle"),
      description: t("home.features.paymentsDesc"),
    },
    {
      icon: Users,
      title: t("home.features.verifiedTitle"),
      description: t("home.features.verifiedDesc"),
    },
    {
      icon: Zap,
      title: t("home.features.lineTitle"),
      description: t("home.features.lineDesc"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              {t("home.hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("home.hero.titleLead")}
              <span className="text-primary"> {t("home.hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/coaches">
                  {t("home.hero.browse")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/member/become-coach">{t("home.hero.startAsCoach")}</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {t("home.hero.ratingStat")}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                {t("home.hero.sessionsStat")}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                {t("home.hero.verifiedStat")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            {t("home.specialties.heading")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SPECIALTY_VALUES.map((value) => (
              <Link key={value} href={`/coaches?specialty=${encodeURIComponent(value)}`}>
                <Badge
                  variant="outline"
                  className="text-sm py-1.5 px-3 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {t(`home.specialties.labels.${value}`)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24" id="how-it-works">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t("home.features.heading", { app: APP_NAME })}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t("home.cta.heading")}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-sm mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/login">{t("home.cta.button")}</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
