import { useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";

const TYPE_STYLES: Record<CalendarEventType, string> = {
  deadline: "bg-danger/15 text-danger",
  live_class: "bg-primary/15 text-primary",
  reminder: "bg-warning/15 text-warning",
  custom: "bg-muted text-muted-foreground",
};

const TYPE_DOTS: Record<CalendarEventType, string> = {
  deadline: "bg-danger",
  live_class: "bg-primary",
  reminder: "bg-warning",
  custom: "bg-muted-foreground",
};

interface CalendarGridProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export function CalendarGrid({ events, onSelectEvent }: CalendarGridProps) {
  const [month, setMonth] = useState(() => new Date());
  const firstDay = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: firstDay, end: endOfMonth(month) });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const eventsFor = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startsAt), day)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-display text-base font-semibold">{format(month, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setMonth(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, i) => {
          const dayEvents = eventsFor(day);
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={i}
              className={cn(
                "min-h-20 border-b border-r p-1 last:border-r-0",
                !inMonth && "bg-muted/30",
                isToday && "bg-accent/40",
              )}
            >
              <span
                className={cn(
                  "mono-data inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday ? "bg-primary font-semibold text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onSelectEvent?.(e)}
                    className={cn("block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium", TYPE_STYLES[e.type], onSelectEvent && "hover:opacity-80")}
                    title={e.title}
                  >
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="block px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-xs text-muted-foreground">
        {(Object.keys(TYPE_STYLES) as CalendarEventType[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5 capitalize">
            <span className={cn("h-2 w-2 rounded-full", TYPE_DOTS[t])} aria-hidden /> {t.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}