"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { format, addMonths } from "date-fns";
import { useCoachAvailability } from "@/hooks/useAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import type { AvailabilitySlot } from "@/types";

interface BookingCalendarProps {
  coachId: string;
  selectedSlotId: string | null;
  onSlotSelect: (slot: AvailabilitySlot) => void;
}

export default function BookingCalendar({
  coachId,
  selectedSlotId,
  onSlotSelect,
}: BookingCalendarProps) {
  const [range, setRange] = useState(() => {
    const now = new Date();
    return {
      from: format(now, "yyyy-MM-dd"),
      to: format(addMonths(now, 2), "yyyy-MM-dd"),
    };
  });

  const { data: slots, isLoading } = useCoachAvailability(coachId, range.from, range.to);

  const events: EventInput[] = (slots ?? []).map((slot) => ({
    id: slot.id,
    start: slot.startTime,
    end: slot.endTime,
    title: slot.status === "BOOKED" ? "Booked" : "Available",
    classNames: [
      slot.status === "AVAILABLE" ? "fc-event-available" : "fc-event-booked",
      slot.id === selectedSlotId ? "ring-2 ring-primary" : "",
    ],
    extendedProps: { slot },
    interactive: slot.status === "AVAILABLE",
    backgroundColor: slot.id === selectedSlotId ? "#16a34a" : undefined,
    borderColor: slot.id === selectedSlotId ? "#15803d" : undefined,
  }));

  function handleEventClick(info: EventClickArg) {
    const slot = info.event.extendedProps.slot as AvailabilitySlot;
    if (slot.status === "AVAILABLE") {
      onSlotSelect(slot);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="booking-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        expandRows
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: "08:00",
          endTime: "20:00",
        }}
        datesSet={(info) => {
          setRange({
            from: format(info.start, "yyyy-MM-dd"),
            to: format(info.end, "yyyy-MM-dd"),
          });
        }}
        eventCursor="pointer"
        eventDisplay="block"
      />
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Click a green slot to select it. Gray slots are already booked.
      </p>
    </div>
  );
}
