import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listNotifications, markAllRead, markRead, unreadCount } from "@/features/notifications/api";
import { formatRelative } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import type { AppNotification } from "@/lib/types";

const TYPE_LABEL: Record<AppNotification["type"], { label: string; variant: "success" | "warning" | "danger" | "secondary" | "muted" }> = {
  assignment: { label: "Assignment", variant: "secondary" },
  payment: { label: "Payment", variant: "warning" },
  announcement: { label: "Announcement", variant: "success" },
  feedback: { label: "Feedback", variant: "muted" },
  system: { label: "System", variant: "muted" },
};

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!user) return;
    unreadCount(user.id).then(setCount);
  }, [user, open]);

  useEffect(() => {
    if (!open || hasLoaded.current || !user) return;
    hasLoaded.current = true;
    listNotifications(user.id).then(setItems);
  }, [open, user]);

  useEffect(() => {
    if (!open) hasLoaded.current = false;
  }, [open]);

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setItems((prev) => prev?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null);
    setCount(0);
  };

  const handleOpenItem = async (n: AppNotification) => {
    if (user && !n.readAt) {
      await markRead(user.id, n.id);
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)) ?? null);
      setCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.relatedEntityId?.startsWith("a-")) navigate(`/app/assignments/${n.relatedEntityId}`);
    else navigate("/app/notifications");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${count ? `, ${count} unread` : ""}`} className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge variant="danger" className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!items ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            items.slice(0, 6).map((n) => (
              <button
                key={n.id}
                onClick={() => handleOpenItem(n)}
                className={`flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.readAt ? "bg-accent/30" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={TYPE_LABEL[n.type].variant}>{TYPE_LABEL[n.type].label}</Badge>
                  {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
                  <span className="ml-auto text-xs text-muted-foreground">{formatRelative(n.createdAt)}</span>
                </div>
                <p className="text-sm font-medium">{n.title}</p>
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => {
            setOpen(false);
            navigate("/app/notifications");
          }}
          className="w-full border-t py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/50"
        >
          View all notifications
        </button>
      </PopoverContent>
    </Popover>
  );
}