import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { CalendarPlus, CalendarDays, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CalendarGrid } from "@/components/shared/calendar-grid";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { addEvent, buildIcs, listEvents, removeEvent } from "@/features/calendar/api";
import { downloadBlob, formatDate } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";

const TYPE_LABEL: Record<CalendarEventType, string> = {
  deadline: "Deadline",
  live_class: "Live class",
  reminder: "Reminder",
  custom: "Custom",
};

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("custom");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("15:00");
  const [saving, setSaving] = useState(false);

  const reload = () => {
    if (!user) return;
    listEvents(user.id).then(setEvents).catch(() => setError("Couldn't load your calendar."));
  };

  useEffect(reload, [user]);

  const dayEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter((e) => isSameDay(new Date(e.startsAt), selected ? new Date(selected.startsAt) : new Date()))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [events, selected]);

  const exportIcs = () => {
    if (!events) return;
    downloadBlob(buildIcs(events, "GeoGrid"), "geogrid-calendar.ics", "text/calendar");
    toast.success("Calendar exported — import it into Google or Apple Calendar.");
  };

  const handleAdd = async () => {
    if (!title.trim() || !user) {
      toast.error("Give the event a title.");
      return;
    }
    setSaving(true);
    try {
      const created = await addEvent({
        userId: user.id,
        title: title.trim(),
        type,
        startsAt: `${date}T${time}:00`,
        endsAt: undefined,
      });
      setEvents((prev) => (prev ? [...prev, created].sort((a, b) => a.startsAt.localeCompare(b.startsAt)) : prev));
      setAddOpen(false);
      setTitle("");
      setSelected(created);
      toast.success("Event added to your calendar.");
    } catch {
      toast.error("Couldn't add the event.");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Deadlines, live classes, and reminders — with a feed you can subscribe to in your own calendar app."
        actions={
          <>
            <Button variant="outline" onClick={exportIcs} disabled={!events?.length}>
              <Download className="h-4 w-4" aria-hidden /> Export .ics
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Add event
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!events ? (
            <Skeleton className="h-96 w-full" />
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="Your deadlines and live classes appear here automatically. Add a reminder to stay on top of your week."
            />
          ) : (
            <CalendarGrid events={events} onSelectEvent={(e) => setSelected(selected?.id === e.id ? null : e)} />
          )}
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {selected ? formatDate(selected.startsAt) : "Today"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayEvents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No events on this day.</p>
            ) : (
              <ul className="space-y-3">
                {dayEvents.map((e) => (
                  <li key={e.id} className="rounded-md border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="mono-data mt-0.5 text-xs text-muted-foreground">{format(new Date(e.startsAt), "h:mm a")}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge variant="outline">{TYPE_LABEL[e.type]}</Badge>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${e.title}`}
                          onClick={async () => {
                            await removeEvent(e.id);
                            setEvents((prev) => prev?.filter((x) => x.id !== e.id) ?? null);
                            if (selected?.id === e.id) setSelected(null);
                            toast.success("Event deleted.");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add event</DialogTitle>
            <DialogDescription>Reminders are private to you; deadlines and live classes come from your tutor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Title</Label>
              <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Revision block — Algebra" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
                <SelectTrigger id="ev-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as CalendarEventType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ev-date">Date</Label>
                <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-time">Time</Label>
                <Input id="ev-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? "Adding…" : "Add event"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}