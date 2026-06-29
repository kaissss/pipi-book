"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { format, addMonths } from "date-fns";
import { Save, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMySlots, useBulkCreateSlots, useDeleteSlot } from "@/hooks/useAvailability";
import { formatDateTime } from "@/lib/utils";
import type { AvailabilitySlot } from "@/types";

interface PendingSlot {
  start: string;
  end: string;
}

export default function CoachSchedulePage() {
  const [range, setRange] = useState(() => {
    const now = new Date();
    return {
      from: format(now, "yyyy-MM-dd"),
      to: format(addMonths(now, 2), "yyyy-MM-dd"),
    };
  });
  // Unsaved slots the coach is drafting before a single bulk save.
  const [pending, setPending] = useState<PendingSlot[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AvailabilitySlot | null>(null);

  const { data: slots } = useMySlots(range.from, range.to);
  const bulkCreate = useBulkCreateSlots();
  const deleteSlot = useDeleteSlot();

  const savedEvents: EventInput[] = (slots ?? []).map((slot) => ({
    id: slot.id,
    start: slot.startTime,
    end: slot.endTime,
    title:
      slot.status === "AVAILABLE" ? "Available" : slot.status === "BOOKED" ? "Booked" : "Blocked",
    className:
      slot.status === "AVAILABLE"
        ? "fc-event-available"
        : slot.status === "BOOKED"
        ? "fc-event-booked"
        : "fc-event-blocked",
    extendedProps: { kind: "saved", slot },
  }));

  const pendingEvents: EventInput[] = pending.map((slot, index) => ({
    id: `pending-${index}`,
    start: slot.start,
    end: slot.end,
    title: "New (unsaved)",
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    extendedProps: { kind: "pending", index },
  }));

  function handleDateSelect(info: DateSelectArg) {
    setPending((prev) => [...prev, { start: info.startStr, end: info.endStr }]);
  }

  function handleEventClick(info: EventClickArg) {
    if (info.event.extendedProps.kind === "pending") {
      const index = info.event.extendedProps.index as number;
      setPending((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDeleteTarget(info.event.extendedProps.slot as AvailabilitySlot);
    }
  }

  async function handleSave() {
    if (pending.length === 0) return;
    await bulkCreate.mutateAsync({
      slots: pending.map((slot) => ({ startTime: slot.start, endTime: slot.end })),
    });
    setPending([]);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteSlot.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Drag on the calendar to add time blocks, then save them all at once.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Button variant="ghost" onClick={() => setPending([])}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button onClick={handleSave} disabled={pending.length === 0 || bulkCreate.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {bulkCreate.isPending
              ? "Saving..."
              : pending.length > 0
              ? `Save ${pending.length} slot${pending.length > 1 ? "s" : ""}`
              : "Save"}
          </Button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {pending.length} unsaved slot{pending.length > 1 ? "s" : ""} (orange). Click an unsaved
          block to remove it, or Save to publish.
        </div>
      )}

      {bulkCreate.isError && (
        <p className="text-sm text-destructive">
          Couldn&rsquo;t save slots. Each must be at least 15 minutes. Please try again.
        </p>
      )}

      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={[...savedEvents, ...pendingEvents]}
            selectable
            selectMirror
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator
            datesSet={(info) => {
              setRange({
                from: format(info.start, "yyyy-MM-dd"),
                to: format(info.end, "yyyy-MM-dd"),
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Delete saved slot */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this slot?</DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-2 space-y-2 text-sm">
              <p><span className="text-muted-foreground">From:</span> {formatDateTime(deleteTarget.startTime)}</p>
              <p><span className="text-muted-foreground">To:</span> {formatDateTime(deleteTarget.endTime)}</p>
              {deleteTarget.status === "BOOKED" && (
                <p className="text-destructive">This slot is booked and can&rsquo;t be deleted.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Close</Button>
            {deleteTarget?.status === "AVAILABLE" && (
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteSlot.isPending}>
                <Trash2 className="h-4 w-4 mr-1" />
                {deleteSlot.isPending ? "Deleting..." : "Delete Slot"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
