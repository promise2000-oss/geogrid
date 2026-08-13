import { calendarEvents } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/types";

export async function listEvents(userId: string): Promise<CalendarEvent[]> {
  await latency();
  return calendarEvents
    .filter((e) => !e.userId || e.userId === userId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function addEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  await latency(200);
  const created: CalendarEvent = { ...event, id: uid("ev") };
  calendarEvents.push(created);
  return created;
}

export async function removeEvent(id: string): Promise<void> {
  await latency(150);
  const idx = calendarEvents.findIndex((e) => e.id === id);
  if (idx >= 0) calendarEvents.splice(idx, 1);
}

/** Builds a downloadable .ics feed so students can subscribe in Google/Apple Calendar. */
export function buildIcs(events: CalendarEvent[], title: string): string {
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}00Z`;
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GeoGrid//GeoGrid Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${esc(title)}`,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@geogrid`,
      `DTSTAMP:${fmt(new Date().toISOString())}`,
      `DTSTART:${fmt(e.startsAt)}`,
      e.endsAt ? `DTEND:${fmt(e.endsAt)}` : "",
      `SUMMARY:${esc(e.title)}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter((l) => l !== "").join("\r\n");
}