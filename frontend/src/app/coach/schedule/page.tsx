"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { format, addMonths } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMySlots, useCreateSlot, useDeleteSlot, useBlockSlot } from "@/hooks/useAvailability";
import { formatDateTime } from "@/lib/utils";
import type { AvailabilitySlot } from "@/types";

export default function CoachSchedulePage() {
  const [range, setRange] = useState(() => {
    const now = new Date();
    return {
      from: format(now, "yyyy-MM-dd"),
      to: format(addMonths(now, 2), "yyyy-MM-dd"),
    };
  });
  const [pendingSlot, setPendingSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const { data: slots } = useMySlots(range.from, range.to);
  const createSlot = useCreateSlot();
  const deleteSlot = useDeleteSlot();
  const blockSlot = useBlockSlot();

  const events: EventInput[] = (slots ?? []).map((slot) => ({
    id: slot.id,
    start: slot.startTime,
    end: slot.endTime,
    title: slot.status === "AVAILABLE" ? "Available" : slot.status === "BOOKED" ? "Booked" : "Blocked",
    className:
      slot.status === "AVAILABLE"
        ? "fc-event-available"
        : slot.status === "BOOKED"
        ? "fc-event-booked"
        : "fc-event-blocked",
    extendedProps: { slot },
  }));

  function handleDateSelect(selectInfo: DateSelectArg) {
    setPendingSlot({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
  }

  function handleEventClick(info: EventClickArg) {
    const slot = info.event.extendedProps.slot as AvailabilitySlot;
    setSelectedSlot(slot);
  }

  async function confirmCreate() {
    if (!pendingSlot) return;
    await createSlot.mutateAsync({
      startTime: pendingSlot.start,
      endTime: pendingSlot.end,
    });
    setPendingSlot(null);
  }

  async function confirmDelete() {
    if (!selectedSlot) return;
    await deleteSlot.mutateAsync(selectedSlot.id);
    setSelectedSlot(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Select time blocks to create available slots.
          </p>
        </div>
      </div>

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
            events={events}
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

      {/* Create slot dialog */}
      <Dialog open={!!pendingSlot} onOpenChange={(open) => !open && setPendingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Available Slot</DialogTitle>
          </DialogHeader>
          {pendingSlot && (
            <div className="py-2 space-y-2 text-sm">
              <p><span className="text-muted-foreground">From:</span> {formatDateTime(pendingSlot.start)}</p>
              <p><span className="text-muted-foreground">To:</span> {formatDateTime(pendingSlot.end)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSlot(null)}>Cancel</Button>
            <Button onClick={confirmCreate} disabled={createSlot.isPending}>
              <Plus className="h-4 w-4 mr-1" />
              {createSlot.isPending ? "Creating..." : "Create Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot actions dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slot Details</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="py-2 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Status:</span> {selectedSlot.status}</p>
              <p><span className="text-muted-foreground">From:</span> {formatDateTime(selectedSlot.startTime)}</p>
              <p><span className="text-muted-foreground">To:</span> {formatDateTime(selectedSlot.endTime)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>Close</Button>
            {selectedSlot?.status === "AVAILABLE" && (
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteSlot.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Slot
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
