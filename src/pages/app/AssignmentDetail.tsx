import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, CloudUpload, Download, FileText, Link2, MessagesSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { RichText } from "@/components/shared/rich-text";
import { Countdown } from "@/components/shared/countdown";
import { ErrorState } from "@/components/shared/error-state";
import { FileDropzone, LinkSubmissionInput } from "@/components/shared/file-dropzone";
import { RubricScorer } from "@/components/shared/rubric-scorer";
import { SubmissionStatusBadge } from "@/components/shared/status-badges";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import {
  addSubmissionComment, getAssignment, getGradeForSubmission, getSubmission,
  listSubmissionComments, rubricFor, saveDraft, subjectName, submitAssignment,
} from "@/features/assignments/api";
import { formatBytes, formatDateTime, formatRelative } from "@/lib/utils";
import type { Assignment, Grade, Submission, SubmissionComment, SubmissionFile } from "@/lib/types";

const TIMELINE: Submission["status"][] = ["submitted", "under_review", "graded"];

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comments, setComments] = useState<SubmissionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [link, setLink] = useState("");
  const [draftState, setDraftState] = useState<"saved" | "dirty" | "saving">("saved");
  const [submitting, setSubmitting] = useState(false);
  const [confirmLateOpen, setConfirmLateOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dirtyRef = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const a = await getAssignment(id);
        const s = await getSubmission(id, user.id);
        setAssignment(a);
        setSubmission(s ?? null);
        if (s) {
          setFiles(s.files);
          setLink(s.link?.url ?? "");
          const g = await getGradeForSubmission(s.id);
          setGrade(g ?? null);
          if (s.status !== "draft") setComments(await listSubmissionComments(s.id));
        }
      } catch {
        setError("Couldn't load this assignment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  // Draft autosave every ~15 seconds
  useEffect(() => {
    if (!assignment || !user || submission?.status === "draft" || submission === null) return;
    autosaveTimer.current = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      setDraftState("saving");
      try {
        await saveDraft(assignment.id, user.id, files, link ? { url: link, label: "Working draft" } : undefined);
        setDraftState("saved");
      } catch {
        setDraftState("dirty");
      }
    }, 15000);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id, user?.id, submission?.status]);

  useEffect(() => {
    if (submission?.status === "draft" || submission === null) return;
    if (files.length || link) {
      dirtyRef.current = true;
      setDraftState("dirty");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- guard covers submission identity
  }, [files, link, submission?.status]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-3/4" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !assignment) return <ErrorState message={error ?? "Assignment not found."} onRetry={() => window.location.reload()} />;

  const isLateNow = new Date(assignment.dueAt).getTime() < now;
  const canSubmit = !submission || submission.status === "draft" || submission.status === "returned";
  const replacing = submission && (submission.status === "submitted" || submission.status === "under_review");
  const rubric = rubricFor(assignment);

  const handleSubmit = async () => {
    if (!user || !id) return;
    if (isLateNow && !assignment.allowLate) {
      toast.error("This assignment doesn't accept late submissions.");
      return;
    }
    if (isLateNow && assignment.allowLate && (files.length || link)) {
      setConfirmLateOpen(true);
      return;
    }
    await doSubmit();
  };

  const doSubmit = async () => {
    if (!user || !id) return;
    if (files.length === 0 && !link) {
      toast.error("Add a file or a link before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await saveDraft(id, user.id, files, link ? { url: link, label: "Working draft" } : undefined);
      const s = await submitAssignment(id, user.id);
      setSubmission(s);
      setDraftState("saved");
      toast.success("Assignment submitted. Your tutor has been notified.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const postComment = async () => {
    if (!user || !submission || !commentBody.trim()) return;
    setPostingComment(true);
    try {
      const c = await addSubmissionComment(submission.id, { id: user.id, name: user.fullName }, commentBody.trim());
      setComments((prev) => [...prev, c]);
      setCommentBody("");
    } finally {
      setPostingComment(false);
    }
  };

  const versionCount = submission?.version ?? 0;

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbItem href="/app/assignments">Assignments</BreadcrumbItem>
        <BreadcrumbItem>{assignment.title}</BreadcrumbItem>
      </Breadcrumb>

      <PageHeader
        title={assignment.title}
        description={`${subjectName(assignment.subjectId)} · set by your tutor`}
        actions={
          submission ? (
            <SubmissionStatusBadge status={submission.status} />
          ) : isLateNow ? (
            <Badge variant="danger">Overdue</Badge>
          ) : (
            <Badge variant="secondary">Not started</Badge>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Instructions column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <RichText html={assignment.instructions} className="prose-sm max-w-none text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2" />
              {assignment.resources.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resources</p>
                  <ul className="space-y-1.5">
                    {assignment.resources.map((r) => (
                      <li key={r.id}>
                        <button
                          onClick={() => toast.success(`Downloading ${r.name} (demo — no file served).`)}
                          className="flex w-full items-center gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm hover:bg-muted/40"
                        >
                          <Download className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                          <span className="truncate font-medium">{r.name}</span>
                          <span className="mono-data ml-auto text-xs text-muted-foreground">{formatBytes(r.size)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline + comments (only once there's a submission) */}
          {submission && submission.status !== "draft" && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex items-center gap-2" aria-label="Submission status timeline">
                  {TIMELINE.map((step, i) => {
                    const idx = TIMELINE.indexOf(submission.status === "returned" ? "under_review" : submission.status);
                    const reached = i <= idx;
                    return (
                      <li key={step} className="flex flex-1 items-center gap-2">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                            reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <span className={`text-xs font-medium capitalize ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.replace("_", " ")}
                        </span>
                        {i < TIMELINE.length - 1 && <span className={`h-px flex-1 ${reached ? "bg-primary" : "bg-muted"}`} aria-hidden />}
                      </li>
                    );
                  })}
                </ol>
                {submission.submittedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Submitted {formatDateTime(submission.submittedAt)} · v{versionCount}
                    {submission.isLate && <Badge variant="warning" className="ml-2">Late{assignment.latePenaltyPct > 0 ? ` · −${assignment.latePenaltyPct}% penalty applies` : ""}</Badge>}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grade panel */}
          {grade && submission && submission.status === "graded" && (
            <Card className="border-success/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your grade</span>
                  <span className="mono-data text-3xl font-semibold text-success">
                    {grade.score}<span className="text-lg text-muted-foreground">/{grade.maxScore}</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {rubric && (
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rubric breakdown · {rubric.name}</p>
                    <RubricScorer rubric={rubric} scores={grade.rubricScores} readOnly />
                  </div>
                )}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tutor feedback</p>
                  <div className="rounded-md border bg-muted/30 p-4">
                    <RichText html={grade.feedbackPublic} className="text-sm leading-relaxed" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Graded by your tutor · {formatRelative(grade.gradedAt)}</p>
              </CardContent>
            </Card>
          )}

          {/* Returned notice */}
          {submission?.status === "returned" && grade && (
            <Alert variant="warning">
              <AlertIcon variant="warning" />
              <AlertTitle>Returned for correction</AlertTitle>
              <AlertDescription>
                Your tutor asked you to rework this submission. Score: {grade.score}/{grade.maxScore}. Feedback is above — fix and resubmit below.
              </AlertDescription>
            </Alert>
          )}

          {/* Comments */}
          {submission && submission.status !== "draft" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessagesSquare className="h-4 w-4 text-muted-foreground" /> Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                  {comments.map((c) => (
                    <li key={c.id} className="rounded-md border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{c.authorName}</p>
                        <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm">{c.body}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Ask a question about your submission…"
                    rows={3}
                    aria-label="Add a comment"
                  />
                  <Button size="sm" onClick={postComment} disabled={postingComment || !commentBody.trim()}>
                    <Send className="h-3.5 w-3.5" aria-hidden /> Post comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Submission column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CloudUpload className="h-4 w-4 text-muted-foreground" /> Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Due {formatDateTime(assignment.dueAt)}
                </span>
                {!isLateNow && <Countdown target={assignment.dueAt} label="" />}
              </div>

              {assignment.allowLate && (
                <p className="text-xs text-muted-foreground">
                  Late submissions accepted with a {assignment.latePenaltyPct}% penalty.
                </p>
              )}
              {!assignment.allowLate && (
                <p className="text-xs text-muted-foreground">Late submissions are not accepted for this assignment.</p>
              )}

              {submission && submission.status !== "draft" && (
                <ul className="space-y-1.5">
                  {submission.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate">{f.name}</span>
                      <span className="mono-data ml-auto text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                    </li>
                  ))}
                  {submission.link && (
                    <li className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <a href={submission.link.url} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">
                        {submission.link.label}
                      </a>
                    </li>
                  )}
                </ul>
              )}

              {(canSubmit || replacing) && (
                <>
                  <FileDropzone files={files} onChange={setFiles} disabled={submitting} />
                  <LinkSubmissionInput value={link} onChange={setLink} />
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span aria-live="polite">
                      {draftState === "saved" && "Draft saved locally."}
                      {draftState === "dirty" && "Unsaved changes — autosaves shortly."}
                      {draftState === "saving" && "Saving draft…"}
                    </span>
                    {versionCount > 0 && <span className="mono-data">v{versionCount + 1} will be submitted</span>}
                  </div>
                  <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
                    {submitting ? "Submitting…" : replacing ? "Replace submission" : submission?.status === "returned" ? "Resubmit" : "Submit assignment"}
                  </Button>
                </>
              )}

              {submission && !canSubmit && !replacing && (
                <p className="text-sm text-muted-foreground">
                  Your submission is in — you'll be notified the moment it's graded. Want to change something? Message your tutor.
                </p>
              )}
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <RouterLink to="/app/assignments"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to assignments</RouterLink>
          </Button>
        </div>
      </div>

      {/* Late-submission confirmation */}
      <Dialog open={confirmLateOpen} onOpenChange={setConfirmLateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit after the deadline?</DialogTitle>
            <DialogDescription>
              This assignment accepts late submissions with a {assignment.latePenaltyPct}% penalty. Your tutor will see
              it marked as late. Confirm to submit anyway.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLateOpen(false)}>Keep working</Button>
            <Button
              onClick={() => {
                setConfirmLateOpen(false);
                void doSubmit();
              }}
            >
              Submit with penalty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}