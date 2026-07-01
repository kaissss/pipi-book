"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { format, addMonths } from "date-fns";
import { useCoachAvailability } from "@/hooks/useAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { slotEventColor } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { AvailabilitySlot } from "@/types";

interface BookingCalendarProps {
  coachId: string;
  selectedSlotId: string | null;
  onSlotSelect: (slot: AvailabilitySlot | null) => void;
  // Only slots whose length equals this (minutes) can be booked.
  serviceDurationMinutes?: number;
}

function slotMinutes(slot: AvailabilitySlot): number {
  return (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000;
}

export default function BookingCalendar({
  coachId,
  selectedSlotId,
  onSlotSelect,
  serviceDurationMinutes,
}: BookingCalendarProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState(() => {
    const now = new Date();
    return {
      from: format(now, "yyyy-MM-dd"),
      to: format(addMonths(now, 2), "yyyy-MM-dd"),
    };
  });

  const { data: slots, isLoading } = useCoachAvailability(coachId, range.from, range.to);

  // A slot is bookable only if it's open AND its length matches the service.
  function isBookable(slot: AvailabilitySlot): boolean {
    if (slot.status !== "AVAILABLE") return false;
    if (!serviceDurationMinutes) return true;
    return slotMinutes(slot) === serviceDurationMinutes;
  }

  const events: EventInput[] = (slots ?? []).map((slot) => {
    const bookable = isBookable(slot);
    const selected = slot.id === selectedSlotId;
    // Every event gets an explicit color: FullCalendar won't reliably revert an
    // inline color back to undefined, which previously left a deselected slot
    // looking "still selected". Selected = green; booked = blue (shared);
    // available (bookable) = grey; unavailable (wrong length) = lighter disabled grey.
    const unavailable = !bookable && slot.status === "AVAILABLE";
    // Selected uses the "unsaved" amber so it stands out from available green.
    const color = selected
      ? "#f59e0b"
      : unavailable
      ? "#d1d5db"
      : slotEventColor(slot.status);
    return {
      id: slot.id,
      start: slot.startTime,
      end: slot.endTime,
      title: selected
        ? t("booking.calendar.availableSelected")
        : bookable
        ? t("booking.calendar.available")
        : slot.status === "BOOKED"
        ? t("booking.calendar.booked")
        : t("booking.calendar.unavailable"),
      backgroundColor: color,
      borderColor: selected ? "#d97706" : color,
      classNames: selected ? ["ring-2 ring-primary ring-offset-1"] : [],
      extendedProps: { slot },
    };
  });

  function handleEventClick(info: EventClickArg) {
    const slot = info.event.extendedProps.slot as AvailabilitySlot;
    if (!isBookable(slot)) return;
    // Toggle: clicking the already-selected slot clears the selection.
    onSlotSelect(slot.id === selectedSlotId ? null : slot);
  }

  // In month view, clicking a date jumps to that week's schedule.
  function handleDateClick(info: DateClickArg) {
    if (info.view.type === "dayGridMonth") {
      info.view.calendar.changeView("timeGridWeek", info.date);
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
          right: "dayGridMonth,timeGridWeek",
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        longPressDelay={250}
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
        eventDisplay="block"
      />
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {serviceDurationMinutes
          ? t("booking.calendar.legendWithDuration", { minutes: serviceDurationMinutes })
          : t("booking.calendar.legend")}
      </p>
    </div>
  );
}
