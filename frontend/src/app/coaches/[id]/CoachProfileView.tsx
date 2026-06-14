"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCoach } from "@/hooks/useCoach";
import CoachProfile from "@/components/coach/CoachProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Props {
  coachId: string;
}

export default function CoachProfileView({ coachId }: Props) {
  const { data: coach, isLoading, error } = useCoach(coachId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Coach not found.</p>
        <Button asChild variant="outline">
          <Link href="/coaches">Back to coaches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/coaches">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All coaches
        </Link>
      </Button>
      <CoachProfile coach={coach} />
    </div>
  );
}
