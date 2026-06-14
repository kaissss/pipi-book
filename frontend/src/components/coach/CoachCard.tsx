import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatCurrency, truncate } from "@/lib/utils";
import type { Coach } from "@/types";

interface CoachCardProps {
  coach: Coach;
}

export default function CoachCard({ coach }: CoachCardProps) {
  const minPrice = coach.services.length > 0
    ? Math.min(...coach.services.map((s) => s.price))
    : null;

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Cover / Avatar area */}
        <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="absolute -bottom-6 left-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
              <AvatarImage src={coach.user.pictureUrl} alt={coach.user.displayName} />
              <AvatarFallback className="text-lg">
                {getInitials(coach.user.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-8 px-4 pb-4">
          {/* Name + rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              {coach.user.displayName}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{coach.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({coach.reviewCount})</span>
            </div>
          </div>

          {/* Experience + location */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {coach.experience}yr exp
            </span>
            {coach.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {coach.location}
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncate(coach.bio, 100)}
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-4">
            {coach.specialties.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {coach.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{coach.specialties.length - 3}
              </Badge>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            {minPrice !== null ? (
              <div>
                <span className="text-xs text-muted-foreground">From </span>
                <span className="font-semibold text-sm">
                  {formatCurrency(minPrice)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No services yet</span>
            )}
            <Button asChild size="sm">
              <Link href={`/coaches/${coach.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
