"use client";

import { Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (service: Service) => void;
}

export default function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
}: ServiceSelectorProps) {
  const activeServices = services.filter((s) => s.isActive);

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services available for booking.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeServices.map((service) => (
        <Card
          key={service.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedServiceId === service.id
              ? "ring-2 ring-primary border-primary"
              : "hover:border-primary/50"
          )}
          onClick={() => onSelect(service)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{service.name}</h3>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {service.type.replace("_", " ").toLowerCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.durationMinutes)}
                  </span>
                  {service.maxParticipants > 1 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Up to {service.maxParticipants} participants
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">{formatCurrency(service.price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
