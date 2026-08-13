import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Clock, FileText, MessageCircle, Receipt, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { StatCard } from "@/components/shared/stat-card";
import { Countdown } from "@/components/shared/countdown";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { getDashboardData, type DashboardData } from "@/features/dashboard/api";
import { listEvents } from "@/features/calendar/api";
import { formatRelative } from "@/lib/utils";
import { WHATSAPP_SUPPORT } from "@/lib/config";
import type { CalendarEvent } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getDashboardData(user.id), listEvents(user.id)])
      .then(([d, events]) => {
        setData(d);
        const now = new Date();
        setMonthEvents(events.filter((e) => new Date(e.startsAt) >= now && new Date(e.startsAt).getMonth() === now.getMonth()));
      })
      .catch(() => setError("Couldn't load your dashboard. Please try again."));
  }, [user]);

  if (error) {
    return (
      <Alert variant="danger">
        <AlertIcon variant="danger" />
        <AlertTitle>Dashboard failed to load</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0] ?? "there"}`}
        description="Here's what needs your attention this week."
        actions={
          data && (
            <Badge variant={data.needsAttention ? "warning" : "success"}>
              {data.needsAttention ? "Payment past due" : `${data.planName} active`}
            </Badge>
          )
        }
      />

      {data?.needsAttention && (
        <Alert variant="warning" className="mb-6">
          <AlertIcon variant="warning" />
          <AlertTitle>One invoice is past due</AlertTitle>
          <AlertDescription>
            Your Premium features stay active during the grace period, but please settle the balance soon.
            <Link to="/app/payments" className="ml-2 font-medium underline underline-offset-2">Pay now</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Due this week" value={data ? String(data.dueThisWeek) : ""} icon={CalendarClock} tone="primary" loading={!data} hint="assignments" />
        <StatCard label="Average grade" value={data ? `${data.avgGradePct}%` : ""} icon={FileText} tone={data && data.avgGradePct >= 70 ? "success" : "default"} loading={!data} />
        <StatCard label="Under review" value={data ? String(data.pendingReview) : ""} icon={Clock} tone="warning" loading={!data} hint="submissions awaiting grading" />
        <StatCard
          label="Account status"
          value={data ? (data.needsAttention ? "Action needed" : "Good standing") : ""}
          icon={data?.needsAttention ? TriangleAlert : Receipt}
          tone={data?.needsAttention ? "warning" : "success"}
          loading={!data}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming deadlines */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming deadlines</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/assignments">All assignments <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!data ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
              </div>
            ) : data.upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing due right now. Enjoy the gap.</p>
            ) : (
              <ul className="divide-y">
                {data.upcoming.slice(0, 4).map(({ assignment, submitted, daysLeft }) => (
                  <li key={assignment.id}>
                    <Link to={`/app/assignments/${assignment.id}`} className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatRelative(assignment.dueAt)}
                          {assignment.allowLate ? " · late accepted (−10%)" : " · no late submissions"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {submitted ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : daysLeft <= 1 ? (
                          <Badge variant="danger">{daysLeft === 0 ? "Due today" : "Due tomorrow"}</Badge>
                        ) : (
                          <Badge variant="secondary">In {daysLeft} days</Badge>
                        )}
                        <Countdown target={assignment.dueAt} label="" className="hidden sm:inline" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent grades</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/grades">View grades <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!data ? (
                <><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></>
              ) : data.recentGrades.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No grades yet — submit your first assignment.</p>
              ) : (
                data.recentGrades.map((g) => (
                  <Link key={g.id} to="/app/grades" className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5 transition-colors hover:bg-muted/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{g.assignmentTitle}</p>
                      <p className="text-xs text-muted-foreground">{g.subject} · {formatRelative(g.gradedAt)}</p>
                    </div>
                    <span className={`mono-data text-lg font-semibold ${g.pct >= 70 ? "text-success" : g.pct >= 50 ? "text-warning" : "text-danger"}`}>
                      {g.score}/{g.maxScore}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthEvents.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                monthEvents.slice(0, 4).map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${e.type === "deadline" ? "bg-danger" : e.type === "live_class" ? "bg-primary" : e.type === "reminder" ? "bg-warning" : "bg-muted-foreground"}`} aria-hidden />
                    <span className="truncate">{e.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatRelative(e.startsAt)}</span>
                  </div>
                ))
              )}
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link to="/app/calendar">Open calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/app/assignments"><FileText className="mr-2 h-4 w-4" /> Submit an assignment</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> Message my tutor on WhatsApp</a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/app/payments"><Receipt className="mr-2 h-4 w-4" /> View latest invoice</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {data && data.unreadNotifications > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/app/notifications" className="text-primary hover:underline">
            {data.unreadNotifications} unread notification{data.unreadNotifications === 1 ? "" : "s"}
          </Link>
          {" "}— including “{data.latestNotificationTitle}” {data.latestNotificationAt && formatRelative(data.latestNotificationAt)}.
        </p>
      )}
    </div>
  );
}