import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Filter, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Countdown } from "@/components/shared/countdown";
import { SubmissionStatusBadge } from "@/components/shared/status-badges";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { listStudentAssignments, subjectName } from "@/features/assignments/api";
import { getSubmission } from "@/features/assignments/api";
import { daysUntil, formatDate } from "@/lib/utils";
import type { Assignment, Submission } from "@/lib/types";

type StatusFilter = "all" | "not_started" | "in_progress" | "submitted" | "under_review" | "graded" | "overdue";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "graded", label: "Graded" },
  { value: "overdue", label: "Overdue" },
];

interface Row {
  assignment: Assignment;
  submission?: Submission;
  filter: StatusFilter;
}

function classify(a: Assignment, s?: Submission): StatusFilter {
  if (a.dueAt < new Date().toISOString() && (!s || s.status === "draft")) return "overdue";
  switch (s?.status) {
    case "draft": return "in_progress";
    case "submitted": return "submitted";
    case "under_review": return "under_review";
    case "graded":
    case "returned": return "graded";
    default: return "not_started";
  }
}

export default function Assignments() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [subject, setSubject] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const assignments = await listStudentAssignments(user.id);
        const withSubs = await Promise.all(
          assignments.map(async (a) => ({ assignment: a, submission: await getSubmission(a.id, user.id) })),
        );
        setRows(withSubs.map(({ assignment, submission }) => ({ assignment, submission, filter: classify(assignment, submission) })));
      } catch {
        setError("Couldn't load assignments.");
      }
    })();
  }, [user]);

  const subjects = useMemo(() => {
    if (!rows) return [];
    return [...new Set(rows.map((r) => subjectName(r.assignment.subjectId)))];
  }, [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    return rows.filter(
      (r) =>
        (filter === "all" || r.filter === filter) &&
        (subject === "all" || subjectName(r.assignment.subjectId) === subject),
    );
  }, [rows, filter, subject]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, not_started: 0, in_progress: 0, submitted: 0, under_review: 0, graded: 0, overdue: 0 };
    rows?.forEach((r) => {
      c.all++;
      c[r.filter]++;
    });
    return c;
  }, [rows]);

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Everything your tutor has set — submit before deadlines, track review, see grades land."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {counts[f.value] !== undefined && (
              <span className={`ml-1.5 mono-data ${filter === f.value ? "opacity-80" : "text-muted-foreground"}`}>{counts[f.value]}</span>
            )}
          </button>
        ))}
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="ml-auto h-8 w-40 text-xs" aria-label="Filter by subject">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!rows && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-14 w-full" /></CardContent></Card>
          ))}
        </div>
      )}

      {rows && visible.length === 0 && (
        <EmptyState
          icon={FileText}
          title={filter === "all" ? "No assignments yet" : "Nothing in this view"}
          description={filter === "all" ? "When your tutor publishes assignments they'll show up here." : "Try a different filter or subject."}
        />
      )}

      {rows && visible.length > 0 && (
        <ul className="space-y-3">
          {visible.map(({ assignment, submission }) => {
            const days = daysUntil(assignment.dueAt);
            const overdue = days < 0;
            return (
              <li key={assignment.id}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <Link to={`/app/assignments/${assignment.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <Paperclip className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {subjectName(assignment.subjectId)} · due {formatDate(assignment.dueAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {submission ? (
                          <SubmissionStatusBadge status={submission.status} />
                        ) : overdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <Countdown target={assignment.dueAt} />
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}