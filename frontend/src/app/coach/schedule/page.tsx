"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventChangeArg,
  EventInput,
} from "@fullcalendar/core";
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
import type { AvailabilitySlot } from "@/types";

interface PendingSlot {
  id: string;
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
  // Saved AVAILABLE slots marked for deletion (multi-select).
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pendingSeq = useRef(0);

  const { data: slots } = useMySlots(range.from, range.to);
  const bulkCreate = useBulkCreateSlots();
  const deleteSlot = useDeleteSlot();

  const savedEvents: EventInput[] = (slots ?? []).map((slot) => {
    const marked = selectedIds.includes(slot.id);
    return {
      id: slot.id,
      start: slot.startTime,
      end: slot.endTime,
      title: marked
        ? "Selected — will delete"
        : slot.status === "AVAILABLE"
        ? "Available"
        : slot.status === "BOOKED"
        ? "Booked"
        : "Blocked",
      editable: false, // saved slots aren't dragged/resized
      ...(marked
        ? { backgroundColor: "#ef4444", borderColor: "#dc2626" }
        : {}),
      className: marked
        ? ""
        : slot.status === "AVAILABLE"
        ? "fc-event-available"
        : slot.status === "BOOKED"
        ? "fc-event-booked"
        : "fc-event-blocked",
      extendedProps: { kind: "saved", slot },
    };
  });

  const pendingEvents: EventInput[] = pending.map((slot) => ({
    id: slot.id,
    start: slot.start,
    end: slot.end,
    title: "Unsaved",
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    editable: true, // draggable + resizable
    extendedProps: { kind: "pending", pendingId: slot.id },
  }));

  function handleDateSelect(info: DateSelectArg) {
    // Month view is navigation-only; create slots in week view.
    if (info.view.type === "dayGridMonth") return;
    const id = `p${pendingSeq.current++}`;
    setPending((prev) => [...prev, { id, start: info.startStr, end: info.endStr }]);
  }

  // In month view, clicking a date jumps to that week's schedule.
  function handleDateClick(info: DateClickArg) {
    if (info.view.type === "dayGridMonth") {
      info.view.calendar.changeView("timeGridWeek", info.date);
    }
  }

  // Drag-move or resize of an unsaved slot.
  function handleEventChange(info: EventChangeArg) {
    const props = info.event.extendedProps;
    if (props.kind !== "pending") {
      info.revert();
      return;
    }
    setPending((prev) =>
      prev.map((slot) =>
        slot.id === props.pendingId
          ? { ...slot, start: info.event.startStr, end: info.event.endStr }
          : slot,
      ),
    );
  }

  function handleEventClick(info: EventClickArg) {
    const props = info.event.extendedProps;
    if (props.kind === "pending") {
      setPending((prev) => prev.filter((slot) => slot.id !== props.pendingId));
      return;
    }
    // Saved: only AVAILABLE slots can be selected for deletion.
    const slot = props.slot as AvailabilitySlot;
    if (slot.status !== "AVAILABLE") return;
    setSelectedIds((prev) =>
      prev.includes(slot.id) ? prev.filter((id) => id !== slot.id) : [...prev, slot.id],
    );
  }

  async function handleSave() {
    if (pending.length === 0) return;
    await bulkCreate.mutateAsync({
      slots: pending.map((slot) => ({ startTime: slot.start, endTime: slot.end })),
    });
    setPending([]);
  }

  async function handleDeleteSelected() {
    await Promise.all(selectedIds.map((id) => deleteSlot.mutateAsync(id)));
    setSelectedIds([]);
    setConfirmDelete(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Drag to add slots, then save. Drag/resize unsaved slots to adjust; click
            available slots to select them for deletion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="ghost" onClick={() => setSelectedIds([])}>
                <X className="h-4 w-4 mr-1" />
                Deselect
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete {selectedIds.length} selected
              </Button>
            </>
          )}
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

      {(pending.length > 0 || selectedIds.length > 0) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {pending.length > 0 && (
            <span>
              {pending.length} unsaved slot{pending.length > 1 ? "s" : ""} (orange) — drag to
              move, drag the top/bottom edge to resize, click to remove.{" "}
            </span>
          )}
          {selectedIds.length > 0 && (
            <span>{selectedIds.length} selected for deletion (red).</span>
          )}
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
              right: "dayGridMonth,timeGridWeek",
            }}
            events={[...savedEvents, ...pendingEvents]}
            selectable
            selectMirror
            editable
            eventResizableFromStart
            // Drag immediately on touch instead of requiring a long-press.
            longPressDelay={0}
            eventLongPressDelay={0}
            selectLongPressDelay={0}
            select={handleDateSelect}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
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

      {/* Confirm batch delete */}
      <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.length} slot{selectedIds.length > 1 ? "s" : ""}?
            </DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            This permanently removes the selected available slots. This can&rsquo;t be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSelected} disabled={deleteSlot.isPending}>
              <Trash2 className="h-4 w-4 mr-1" />
              {deleteSlot.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
