"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Globe, Award, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatCurrency, formatDuration } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { Coach } from "@/types";

interface CoachProfileProps {
  coach: Coach;
}

export default function CoachProfile({ coach }: CoachProfileProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column — main info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={coach.user.avatar} alt={coach.user.displayName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(coach.user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{coach.user.displayName}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {t("coachPublic.profile.ratingSummary", {
                      rating: coach.rating.toFixed(1),
                      count: coach.reviewCount,
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t("coachPublic.profile.yearsExperience", { years: coach.experience })}
                  </span>
                  {coach.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {coach.location}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {coach.specialties.map((spec) => (
                    <Badge key={spec} variant="secondary">{t(`taxonomy.specialty.${spec}`)}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("coachPublic.profile.about")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {coach.bio}
            </p>
          </CardContent>
        </Card>

        {/* Languages + Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coach.languages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" /> {t("coachPublic.profile.languages")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {coach.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{t(`taxonomy.language.${lang}`)}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {coach.certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" /> {t("coachPublic.profile.certifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {coach.certifications.map((cert) => (
                    <li key={cert} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reviews placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t("coachPublic.profile.reviews")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">
              {t("coachPublic.profile.reviewsComingSoon")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right column — services + book */}
      <div className="space-y-4">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="text-base">{t("coachPublic.profile.services")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coach.services.filter((s) => s.isActive).map((service, idx) => (
              <div key={service.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm">{service.name}</span>
                    <span className="font-semibold text-sm shrink-0">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.durationMinutes)}
                    <Badge variant="outline" className="text-xs ml-1">
                      {t(`coachPublic.profile.serviceType.${service.type}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {coach.services.filter((s) => s.isActive).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("coachPublic.profile.noServices")}
              </p>
            )}

            <Button asChild className="w-full mt-4">
              <Link href={`/coaches/${coach.id}/book`}>{t("coachPublic.profile.bookSession")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
