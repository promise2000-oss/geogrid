import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Inbox, Link2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SubmissionStatusBadge } from "@/components/shared/status-badges";
import { RubricScorer } from "@/components/shared/rubric-scorer";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { getQueueSubmission, gradeSubmission, listSubmissionQueue, returnSubmission, type QueueItem } from "@/features/console/api";
import { assignmentById, rubricFor } from "@/features/assignments/api";
import { formatDate } from "@/lib/utils";
import type { Rubric } from "@/lib/types";

type Filter = "all" | "under_review" | "submitted" | "graded" | "returned";

export default function ConsoleSubmissions() {
  const { writeAudit, requireReauth } = useAdminAuth();
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("under_review");
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [rubric, setRubric] = useState<Rubric | undefined>();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState("");

  const selectedId = selected?.submission.id;

  const reload = () => {
    listSubmissionQueue(filter === "all" ? undefined : filter)
      .then((q) => {
        setQueue(q);
        if (selectedId) {
          getQueueSubmission(selectedId).then((s) => setSelected(s ?? null));
        }
      })
      .catch(() => setError("Couldn't load the submission queue."));
  };

  useEffect(reload, [filter, selectedId]);

  const openItem = async (item: QueueItem) => {
    setSelected(item);
    setScores({});
    setFeedback("");
    setPrivateNote("");
    const a = assignmentById(item.submission.assignmentId);
    const r = a ? await rubricFor(a) : undefined;
    setRubric(r);
    if (r) {
      const initial: Record<string, number> = {};
      r.criteria.forEach((c) => (initial[c.id] = 0));
      setScores(initial);
    }
  };

  const handleGrade = async () => {
    if (!selected) return;
    await requireReauth();
    setBusy(true);
    try {
      await gradeSubmission(selected.submission.id, { rubricScores: scores, feedbackPublic: feedback, notesPrivate: privateNote || undefined });
      writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "submission.graded", targetType: "submission", targetId: selected.submission.id, ip: "192.168.1.10", userAgent: "Console", metadata: { rubricScores: scores } });
      toast.success(`Graded ${selected.studentName}'s submission.`);
      setSelected(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Grading failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleReturn = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await returnSubmission(selected.submission.id, returnFeedback);
      writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "submission.returned", targetType: "submission", targetId: selected.submission.id, ip: "192.168.1.10", userAgent: "Console" });
      toast.success(`Returned to ${selected.studentName} for revision.`);
      setReturnOpen(false);
      setReturnFeedback("");
      setSelected(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't return the submission.");
    } finally {
      setBusy(false);
    }
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="The grading queue — rubric scoring with feedback, or return for revision."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !queue ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle>Queue</CardTitle>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="w-full flex-wrap">
                  <TabsTrigger value="under_review">In review</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="graded">Graded</TabsTrigger>
                  <TabsTrigger value="returned">Returned</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <EmptyState icon={Inbox} title="Queue is clear" description="Nothing matches this filter. Nice work." />
              ) : (
                <ul className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                  {queue.map((q) => (
                    <li key={q.submission.id}>
                      <button
                        type="button"
                        onClick={() => openItem(q)}
                        className={`w-full rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 ${selected?.submission.id === q.submission.id ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{q.studentName}</p>
                            <p className="truncate text-xs text-muted-foreground">{q.assignmentTitle} · {q.subject}</p>
                          </div>
                          <SubmissionStatusBadge status={q.submission.status} />
                        </div>
                        <p className="mono-data mt-2 text-xs text-muted-foreground">
                          Submitted {formatDate(q.submission.submittedAt ?? new Date().toISOString())} · {q.daysInQueue}d in queue
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {!selected ? (
            <Card className="flex min-h-[540px] items-center justify-center">
              <CardContent className="text-center text-sm text-muted-foreground">
                <Inbox className="mx-auto mb-2 h-8 w-8" aria-hidden />
                Select a submission to grade it against the rubric.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selected.studentName} · {selected.assignmentTitle}
                  <SubmissionStatusBadge status={selected.submission.status} className="ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Submission</p>
                  {selected.submission.link ? (
                    <a
                      href={selected.submission.link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md border p-3 text-sm text-primary hover:bg-accent"
                    >
                      <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{selected.submission.link.label}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 shrink-0" aria-hidden />
                      {selected.submission.files.length} file{selected.submission.files.length === 1 ? "" : "s"} attached (download via Supabase Storage in the real build)
                    </div>
                  )}
                </div>

                {rubric ? (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Rubric · {rubric.name} — {totalScore}/{rubric.criteria.reduce((a, c) => a + c.maxPoints, 0)} pts
                    </p>
                    <RubricScorer rubric={rubric} scores={scores} onScoreChange={(criterionId, score) => setScores((prev) => ({ ...prev, [criterionId]: score }))} maxScore={rubric.criteria.reduce((a, c) => a + c.maxPoints, 0)} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No rubric configured for this assignment.</p>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="cs-feedback">Public feedback (student-visible)</Label>
                  <Textarea id="cs-feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What they did well and what to focus on…" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-note">Private note (staff only)</Label>
                  <Textarea id="cs-note" rows={2} value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} placeholder="e.g. flagged for possible AI-generated content" />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setReturnOpen(true)}>
                    <RotateCcw className="h-4 w-4" aria-hidden /> Return for revision
                  </Button>
                  <Button onClick={handleGrade} disabled={busy || !feedback.trim()}>
                    <Send className="h-4 w-4" aria-hidden />
                    {busy ? "Releasing…" : `Release grade (${totalScore} pts)`}
                  </Button>
                </div>
                <p className="text-right text-xs text-muted-foreground">
                  Re-authentication required for release · graded and returned actions are audit-logged.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Return submission</DialogTitle>
            <DialogDescription>
              The student can revise and resubmit. Feedback is mandatory — a return with no feedback is a failed review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rt-feedback">Feedback</Label>
            <Textarea id="rt-feedback" rows={3} value={returnFeedback} onChange={(e) => setReturnFeedback(e.target.value)} placeholder="What needs to change before resubmission?" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button variant="warning" disabled={!returnFeedback.trim() || busy} onClick={handleReturn}>Return for revision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}