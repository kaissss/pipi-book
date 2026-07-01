"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCoachProfile } from "@/hooks/useCoach";
import { SPECIALTIES, LANGUAGES } from "@/lib/constants";
import { useTranslation } from "@/i18n";

export default function BecomeCoachPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isCoach } = useAuth();
  const createProfile = useCreateCoachProfile();

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [certifications, setCertifications] = useState("");

  // Already a coach — send them straight to their portal.
  useEffect(() => {
    if (isCoach) {
      router.replace("/coach/dashboard");
    }
  }, [isCoach, router]);

  if (isCoach) return null;

  function toggle(list: string[], setList: (next: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    createProfile.mutate({
      bio: bio.trim(),
      specialties: selectedSpecialties,
      experience,
      languages: selectedLanguages,
      location: location.trim() || undefined,
      certifications: certifications
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  }

  const isValid = bio.trim().length > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-md">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("member.becomeCoach.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("member.becomeCoach.subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("member.becomeCoach.aboutYou")}</CardTitle>
            <CardDescription>
              {t("member.becomeCoach.aboutYouDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">{t("member.becomeCoach.bioLabel")}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder={t("member.becomeCoach.bioPlaceholder")}
                rows={5}
                maxLength={2000}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">{t("member.becomeCoach.experienceLabel")}</Label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(event) => setExperience(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("member.becomeCoach.locationLabel")}</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={t("member.becomeCoach.locationPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("member.becomeCoach.specialtiesTitle")}</CardTitle>
            <CardDescription>{t("member.becomeCoach.specialtiesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggle(selectedSpecialties, setSelectedSpecialties, specialty)}
                >
                  {t(`taxonomy.specialty.${specialty}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("member.becomeCoach.languagesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <Badge
                  key={language}
                  variant={selectedLanguages.includes(language) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggle(selectedLanguages, setSelectedLanguages, language)}
                >
                  {t(`taxonomy.language.${language}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("member.becomeCoach.certificationsTitle")}</CardTitle>
            <CardDescription>{t("member.becomeCoach.certificationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={certifications}
              onChange={(event) => setCertifications(event.target.value)}
              placeholder={t("member.becomeCoach.certificationsPlaceholder")}
              rows={4}
            />
          </CardContent>
        </Card>

        {createProfile.isError && (
          <p className="text-sm text-destructive">
            {t("member.becomeCoach.submitError")}
          </p>
        )}

        <Button type="submit" disabled={!isValid || createProfile.isPending}>
          {createProfile.isPending ? t("member.becomeCoach.creating") : t("member.becomeCoach.submit")}
        </Button>
      </form>
    </div>
  );
}
