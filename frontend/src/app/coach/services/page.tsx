"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCoachProfile, useCoachServices_Manage } from "@/hooks/useCoach";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { Service } from "@/types";

// Map a stored service type to the capitalized suffix of its coachPortal
// translation key (e.g. "ONE_ON_ONE" -> "OneOnOne" -> coachPortal.services.typeOneOnOne).
const SERVICE_TYPE_KEY: Record<Service["type"], string> = {
  ONE_ON_ONE: "OneOnOne",
  GROUP: "Group",
  WORKSHOP: "Workshop",
};

function serviceTypeKey(type: Service["type"]): string {
  return SERVICE_TYPE_KEY[type];
}

const DEFAULT_SERVICE: Omit<Service, "id" | "coachId" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  type: "ONE_ON_ONE",
  durationMinutes: 60,
  price: 1500,
  currency: "TWD",
  maxParticipants: 1,
  isActive: true,
};

export default function CoachServicesPage() {
  const { t } = useTranslation();
  const { data: coach, isLoading } = useMyCoachProfile();
  const { createService, updateService, deleteService } = useCoachServices_Manage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(DEFAULT_SERVICE);

  function openCreate() {
    setEditing(null);
    setForm(DEFAULT_SERVICE);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    const { id, coachId, createdAt, updatedAt, ...rest } = service;
    setForm(rest);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateService.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createService.mutateAsync(form);
    }
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("coachPortal.services.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("coachPortal.services.subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("coachPortal.services.addService")}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {coach?.services.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{t("coachPortal.services.emptyMessage")}</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("coachPortal.services.createService")}
            </Button>
          </CardContent>
        </Card>
      )}

      {coach?.services && coach.services.length > 0 && (
        <div className="space-y-3">
          {coach.services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge variant={service.isActive ? "default" : "secondary"} className="text-xs">
                        {service.isActive
                          ? t("coachPortal.services.statusActive")
                          : t("coachPortal.services.statusInactive")}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {t(`coachPortal.services.type${serviceTypeKey(service.type)}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(service.durationMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteService.mutate(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("coachPortal.services.editServiceTitle")
                : t("coachPortal.services.newServiceTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("coachPortal.services.serviceName")}</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("coachPortal.services.serviceNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("coachPortal.services.description")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("coachPortal.services.descriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("coachPortal.services.type")}</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Service["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_ON_ONE">{t("coachPortal.services.typeOneOnOne")}</SelectItem>
                    <SelectItem value="GROUP">{t("coachPortal.services.typeGroup")}</SelectItem>
                    <SelectItem value="WORKSHOP">{t("coachPortal.services.typeWorkshop")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("coachPortal.services.durationLabel")}</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("coachPortal.services.priceLabel")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("coachPortal.services.maxParticipants")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.actions.cancel")}
              </Button>
              <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                {editing
                  ? t("coachPortal.services.saveChanges")
                  : t("coachPortal.services.createService")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
