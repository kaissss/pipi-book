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
import type { Service } from "@/types";

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
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your coaching offerings.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
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
            <p className="text-muted-foreground mb-4">No services yet. Create your first offering.</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Service
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
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {service.type.replace("_", " ").toLowerCase()}
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
            <DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Career Strategy Session"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What will the client get from this session?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Service["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_ON_ONE">1-on-1</SelectItem>
                    <SelectItem value="GROUP">Group</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
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
                <Label>Price (TWD)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
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
                Cancel
              </Button>
              <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                {editing ? "Save Changes" : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
