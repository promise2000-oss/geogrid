import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { getPreferences, listNotifications, markAllRead, markRead, updatePreference } from "@/features/notifications/api";
import { formatRelative } from "@/lib/utils";
import type { AppNotification, NotificationCategory, NotificationPreference } from "@/lib/types";

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  assignment: "Assignments",
  payment: "Billing",
  announcement: "Announcements",
  feedback: "Grades & feedback",
  system: "System & security",
};

const CHANNEL_LABEL: Record<"inApp" | "email" | "whatsapp", string> = {
  inApp: "In-app",
  email: "Email",
  whatsapp: "WhatsApp",
};

const CHANNEL_BADGE: Record<AppNotification["channel"], string> = {
  in_app: "In-app",
  email: "Email",
  whatsapp: "WhatsApp",
};

const FILTERS: ("all" | NotificationCategory)[] = ["all", "assignment", "payment", "announcement", "feedback", "system"];

type PrefMap = Record<NotificationCategory, { inApp: boolean; email: boolean; whatsapp: boolean }>;

const toPrefMap = (prefs: NotificationPreference[]): PrefMap =>
  Object.fromEntries(prefs.map((x) => [x.category, { inApp: x.inApp, email: x.email, whatsapp: x.whatsapp }])) as PrefMap;

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | NotificationCategory>("all");
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [visible, setVisible] = useState(8);
  const [prefs, setPrefs] = useState<PrefMap>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setVisible(8);
    listNotifications(user.id, filter).then(setItems).catch(() => setError("Couldn't load notifications."));
  }, [user, filter]);

  useEffect(() => {
    if (!user || prefs) return;
    getPreferences(user.id)
      .then((p) => setPrefs(toPrefMap(p)))
      .catch(() => setError("Couldn't load notification preferences."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRead = async (id: string) => {
    if (!user) return;
    await markRead(user.id, id);
    setItems((prev) => prev?.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)) ?? null);
  };

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setItems((prev) => prev?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null);
    toast.success("All notifications marked as read.");
  };

  const togglePref = async (category: NotificationCategory, channel: "inApp" | "email" | "whatsapp", enabled: boolean) => {
    if (!user) return;
    const next = await updatePreference(user.id, category, channel, enabled);
    setPrefs(toPrefMap(next));
  };

  const unread = items?.filter((n) => !n.readAt).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Everything GeoGrid tells you — grades, deadlines, invoices, and security alerts — and how you'd like to hear it."
      />

      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!error && (
        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">Feed {unread > 0 && <Badge variant="default" className="ml-1.5">{unread}</Badge>}</TabsTrigger>
            <TabsTrigger value="prefs">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : CATEGORY_LABEL[f]}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleMarkAll} disabled={unread === 0}>
                <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all read
              </Button>
            </div>

            {!items ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : items.length === 0 ? (
              <EmptyState icon={Bell} title="No notifications here" description={`Nothing in ${filter === "all" ? "your inbox" : `the ${CATEGORY_LABEL[filter as NotificationCategory]} category`}.`} />
            ) : (
              <>
                <ul className="space-y-2">
                  {items.slice(0, visible).map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => !n.readAt && handleRead(n.id)}
                        className={`flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 ${n.readAt ? "" : "border-primary/50 shadow-sm"}`}
                      >
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-muted-foreground/30" : "bg-primary"}`} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{n.title}</span>
                            <Badge variant="outline">{CATEGORY_LABEL[n.type]}</Badge>
                            {n.channel !== "in_app" && (
                              <Badge variant="secondary">{CHANNEL_BADGE[n.channel]}</Badge>
                            )}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">{n.body}</span>
                          <span className="mono-data mt-1 block text-xs text-muted-foreground">{formatRelative(n.createdAt)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {visible < items.length && (
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setVisible((v) => v + 8)}>
                    Load more ({items.length - visible} remaining)
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="prefs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Inbox className="h-4 w-4 text-muted-foreground" /> Notification channels</CardTitle>
              </CardHeader>
              <CardContent>
                {!prefs ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        {(["inApp", "email", "whatsapp"] as const).map((c) => (
                          <TableHead key={c} className="text-center">{CHANNEL_LABEL[c]}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Object.keys(CATEGORY_LABEL) as NotificationCategory[]).map((cat) => {
                        const p = prefs[cat] ?? { inApp: true, email: true, whatsapp: true };
                        return (
                          <TableRow key={cat}>
                            <TableCell className="font-medium">{CATEGORY_LABEL[cat]}</TableCell>
                            {(["inApp", "email", "whatsapp"] as const).map((c) => (
                              <TableCell key={c} className="text-center">
                                <Switch
                                  aria-label={`${CATEGORY_LABEL[cat]} via ${CHANNEL_LABEL[c]}`}
                                  checked={p[c]}
                                  disabled={c === "inApp"}
                                  onCheckedChange={(v) => togglePref(cat, c, v)}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  In-app notifications can't be turned off. WhatsApp delivery is subject to opt-in consent and may carry standard rates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}