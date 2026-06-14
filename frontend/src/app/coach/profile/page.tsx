"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCoachProfile, useUpdateCoachProfile } from "@/hooks/useCoach";
import { SPECIALTIES, LANGUAGES } from "@/lib/constants";

export default function CoachProfilePage() {
  const { data: coach, isLoading } = useMyCoachProfile();
  const updateProfile = useUpdateCoachProfile();

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("Asia/Taipei");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [certifications, setCertifications] = useState("");

  useEffect(() => {
    if (coach) {
      setBio(coach.bio);
      setExperience(coach.experience);
      setLocation(coach.location ?? "");
      setTimezone(coach.timezone);
      setSelectedSpecialties(coach.specialties);
      setSelectedLanguages(coach.languages);
      setCertifications(coach.certifications.join("\n"));
    }
  }, [coach]);

  function toggleSpecialty(s: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleLanguage(l: string) {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({
      bio,
      experience,
      location,
      timezone,
      specialties: selectedSpecialties,
      languages: selectedLanguages,
      certifications: certifications.split("\n").map((c) => c.trim()).filter(Boolean),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Coach Profile</h1>
        <p className="text-muted-foreground mt-1">How clients see you on PiPiBook.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential clients about your background, approach, and what you help with..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Taipei, Taiwan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Taipei"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Specialties</CardTitle>
            <CardDescription>Select all that apply.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <Badge
                  key={s}
                  variant={selectedSpecialties.includes(s) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleSpecialty(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <Badge
                  key={l}
                  variant={selectedLanguages.includes(l) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleLanguage(l)}
                >
                  {l}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certifications</CardTitle>
            <CardDescription>One per line.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="ICF PCC Certification&#10;NLP Practitioner&#10;..."
              rows={4}
            />
          </CardContent>
        </Card>

        {updateProfile.error && (
          <p className="text-sm text-destructive">Failed to update profile. Please try again.</p>
        )}

        <Button type="submit" disabled={updateProfile.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateProfile.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
