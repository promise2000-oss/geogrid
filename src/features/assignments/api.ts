import { assignments, subjects, rubrics, submissions, grades, submissionComments, users } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import type { Assignment, Grade, Submission, SubmissionComment } from "@/lib/types";

export function assignmentById(id: string): Assignment | undefined {
  return assignments.find((a) => a.id === id);
}

export function subjectName(subjectId: string): string {
  return subjects.find((s) => s.id === subjectId)?.name ?? "Unknown subject";
}

export function rubricFor(assignment: Assignment) {
  return assignment.rubricId ? rubrics.find((r) => r.id === assignment.rubricId) : undefined;
}

export async function listStudentAssignments(studentId: string): Promise<Assignment[]> {
  await latency();
  return assignments.filter((a) => a.status !== "draft" && (a.assigneeIds.length === 0 || a.assigneeIds.includes(studentId)));
}

export async function getAssignment(id: string): Promise<Assignment> {
  await latency(80);
  const a = assignmentById(id);
  if (!a) throw new Error("Assignment not found.");
  return a;
}

export async function getSubmission(assignmentId: string, studentId: string): Promise<Submission | undefined> {
  await latency(80);
  return submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  await latency(60);
  return submissions.find((s) => s.id === id);
}

export async function getGradeForSubmission(submissionId: string): Promise<Grade | undefined> {
  await latency(60);
  return grades.find((g) => g.submissionId === submissionId);
}

export async function listSubmissionComments(submissionId: string): Promise<SubmissionComment[]> {
  await latency(60);
  return submissionComments.filter((c) => c.submissionId === submissionId);
}

export async function addSubmissionComment(submissionId: string, author: { id: string; name: string }, body: string): Promise<SubmissionComment> {
  await latency(200);
  const comment: SubmissionComment = {
    id: uid("cm"),
    submissionId,
    authorId: author.id,
    authorName: author.name,
    body,
    createdAt: new Date().toISOString(),
  };
  submissionComments.push(comment);
  return comment;
}

export async function saveDraft(assignmentId: string, studentId: string, files: Submission["files"], link?: Submission["link"]): Promise<Submission> {
  await latency(150);
  let sub = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId && s.status === "draft");
  if (!sub) {
    sub = {
      id: uid("s"),
      assignmentId,
      studentId,
      status: "draft",
      version: 1,
      isLate: false,
      files: [],
    };
    submissions.push(sub);
  }
  sub.files = files;
  sub.link = link;
  sub.draftSavedAt = new Date().toISOString();
  return sub;
}

export async function submitAssignment(assignmentId: string, studentId: string): Promise<Submission> {
  await latency(350);
  const assignment = assignmentById(assignmentId);
  if (!assignment) throw new Error("Assignment not found.");
  const existing = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  const isLate = new Date(assignment.dueAt).getTime() < Date.now();
  if (isLate && !assignment.allowLate) throw new Error("This assignment does not accept late submissions.");
  const sub: Submission = {
    id: existing?.id ?? uid("s"),
    assignmentId,
    studentId,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    isLate,
    version: (existing?.version ?? 0) + 1,
    files: existing?.files ?? [],
    link: existing?.link,
  };
  const idx = submissions.findIndex((s) => s.id === sub.id);
  if (idx >= 0) submissions[idx] = sub;
  else submissions.push(sub);
  return sub;
}

export async function listMyGrades(studentId: string): Promise<Grade[]> {
  await latency();
  const mine = submissions.filter((s) => s.studentId === studentId).map((s) => s.id);
  return grades.filter((g) => mine.includes(g.submissionId));
}

export function tutorOf(_studentId: string): string {
  return users.find((u) => u.id === "u-instructor-1")?.fullName ?? "Your tutor";
}