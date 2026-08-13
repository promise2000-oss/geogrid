import { assignments, grades, invoices, notifications, submissions } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { assignmentById, subjectName } from "@/features/assignments/api";
import type { Assignment, Grade } from "@/lib/types";

export interface UpcomingItem {
  assignment: Assignment;
  submitted: boolean;
  daysLeft: number;
}

export interface RecentGrade extends Grade {
  assignmentTitle: string;
  subject: string;
  pct: number;
}

export interface DashboardData {
  dueThisWeek: number;
  avgGradePct: number;
  pendingReview: number;
  needsAttention: boolean;
  upcoming: UpcomingItem[];
  recentGrades: RecentGrade[];
  latestNotificationTitle?: string;
  latestNotificationAt?: string;
  unreadNotifications: number;
  subscriptionStatus: string;
  planName: string;
}

export async function getDashboardData(studentId: string): Promise<DashboardData> {
  await latency(250);
  const now = Date.now();
  const weekEnd = now + 7 * 86400000;

  const visible = assignments.filter((a) => a.status === "published" || a.status === "scheduled");
  const upcoming = visible
    .map((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
      return {
        assignment: a,
        submitted: !!sub && sub.status !== "draft",
        daysLeft: Math.ceil((new Date(a.dueAt).getTime() - now) / 86400000),
      };
    })
    .filter((u) => u.assignment.dueAt >= new Date(now).toISOString())
    .sort((a, b) => a.assignment.dueAt.localeCompare(b.assignment.dueAt));

  const mySubmissions = submissions.filter((s) => s.studentId === studentId).map((s) => s.id);
  const myGrades = grades.filter((g) => mySubmissions.includes(g.submissionId) && g.status === "released");
  const avgGradePct = myGrades.length
    ? Math.round((myGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / myGrades.length) * 10) / 10
    : 0;

  const recentGrades: RecentGrade[] = myGrades
    .sort((a, b) => b.gradedAt.localeCompare(a.gradedAt))
    .slice(0, 3)
    .map((g) => {
      const a = assignmentById(submissions.find((s) => s.id === g.submissionId)?.assignmentId ?? "");
      return {
        ...g,
        assignmentTitle: a?.title ?? "Assignment",
        subject: a ? subjectName(a.subjectId) : "—",
        pct: Math.round((g.score / g.maxScore) * 100),
      };
    });

  const myNotifications = notifications
    .filter((n) => n.userId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const pastDue = invoices.some((i) => i.status === "past_due");

  return {
    dueThisWeek: upcoming.filter((u) => u.assignment.dueAt <= new Date(weekEnd).toISOString()).length,
    avgGradePct,
    pendingReview: submissions.filter((s) => s.studentId === studentId && s.status === "under_review").length,
    needsAttention: pastDue,
    upcoming,
    recentGrades,
    latestNotificationTitle: myNotifications[0]?.title,
    latestNotificationAt: myNotifications[0]?.createdAt,
    unreadNotifications: myNotifications.filter((n) => !n.readAt).length,
    subscriptionStatus: pastDue ? "Payment past due" : "Premium active",
    planName: "Premium",
  };
}