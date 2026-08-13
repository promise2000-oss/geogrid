import {
  admins,
  analyticsSeries,
  announcements,
  assignments,
  auditLog,
  contentStats,
  coupons,
  emailTemplates,
  faqs,
  rosterStudents,
  rosterSubmissions,
  transactions,
  testimonials,
  users,
} from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import { assignmentById, subjectName } from "@/features/assignments/api";
import type {
  AdminProfile,
  Announcement,
  Assignment,
  AuditLogEntry,
  ContentStats,
  Coupon,
  EmailTemplate,
  Faq,
  RosterStudent,
  Submission,
  Testimonial,
  Transaction,
} from "@/lib/types";

/* ---------- roster & students ---------- */

export async function listStudents(): Promise<RosterStudent[]> {
  await latency();
  return [...rosterStudents];
}

export async function getStudent(id: string): Promise<RosterStudent | undefined> {
  await latency(60);
  return rosterStudents.find((s) => s.id === id);
}

export async function suspendStudent(id: string, _reason: string): Promise<void> {
  await latency(250);
  const s = rosterStudents.find((x) => x.id === id);
  if (s) s.status = "suspended";
}

export async function reinstateStudent(id: string): Promise<void> {
  await latency(250);
  const s = rosterStudents.find((x) => x.id === id);
  if (s) s.status = "active";
}

export async function deleteStudent(id: string): Promise<void> {
  await latency(400);
  const idx = rosterStudents.findIndex((x) => x.id === id);
  if (idx >= 0) rosterStudents.splice(idx, 1);
}

export async function listAllAssignments(): Promise<Assignment[]> {
  await latency();
  return [...assignments].sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

/* ---------- submission queue ---------- */

export interface QueueItem {
  submission: Submission;
  studentName: string;
  assignmentTitle: string;
  subject: string;
  daysInQueue: number;
}

export async function listSubmissionQueue(filter?: Submission["status"] | "all"): Promise<QueueItem[]> {
  await latency();
  return rosterSubmissions
    .filter((s) => filter === undefined || filter === "all" || s.status === filter)
    .map((s) => {
      const a = assignmentById(s.assignmentId);
      const student = rosterStudents.find((x) => x.id === s.studentId);
      return {
        submission: s,
        studentName: student?.name ?? "Unknown student",
        assignmentTitle: a?.title ?? "Unknown assignment",
        subject: a ? subjectName(a.subjectId) : "—",
        daysInQueue: Math.max(0, Math.round((Date.now() - new Date(s.submittedAt ?? Date.now()).getTime()) / 86400000)),
      };
    })
    .sort((a, b) => a.submission.submittedAt!.localeCompare(b.submission.submittedAt!));
}

export async function getQueueSubmission(id: string): Promise<QueueItem | undefined> {
  await latency(60);
  const item = (await listSubmissionQueue(undefined)).find((i) => i.submission.id === id);
  return item;
}

export async function gradeSubmission(
  id: string,
  _payload: { rubricScores: Record<string, number>; feedbackPublic: string; notesPrivate?: string },
): Promise<void> {
  await latency(400);
  const item = rosterSubmissions.find((s) => s.id === id);
  if (!item) throw new Error("Submission not found.");
  item.status = "graded";
}

export async function returnSubmission(id: string, feedback: string): Promise<void> {
  await latency(300);
  const item = rosterSubmissions.find((s) => s.id === id);
  if (!item) throw new Error("Submission not found.");
  if (!feedback.trim()) throw new Error("Feedback is required to return a submission.");
  item.status = "returned";
}

/* ---------- billing ops ---------- */

export async function listTransactions(): Promise<Transaction[]> {
  await latency();
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

export async function issueRefund(txId: string, reasonCode: string, _note?: string): Promise<void> {
  await latency(450);
  const tx = transactions.find((t) => t.id === txId);
  if (!tx) throw new Error("Transaction not found.");
  if (!reasonCode) throw new Error("A reason code is required for refunds.");
  tx.status = "refunded";
}

export async function listCoupons(): Promise<Coupon[]> {
  await latency();
  return [...coupons];
}

export async function createCoupon(input: Omit<Coupon, "id" | "redemptions">): Promise<Coupon> {
  await latency(300);
  const coupon: Coupon = { ...input, id: uid("cp"), redemptions: 0 };
  coupons.push(coupon);
  return coupon;
}

/* ---------- RBAC ---------- */

export async function listAdmins(): Promise<AdminProfile[]> {
  await latency();
  return [...admins];
}

export async function setAdminRole(adminId: string, role: AdminProfile["role"]): Promise<void> {
  await latency(300);
  const a = admins.find((x) => x.id === adminId);
  if (a) a.role = role;
}

/* ---------- content ---------- */

export async function listAnnouncements(): Promise<Announcement[]> {
  await latency();
  return [...announcements].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function upsertAnnouncement(input: Omit<Announcement, "id" | "createdBy" | "publishedAt"> & { id?: string }): Promise<Announcement> {
  await latency(300);
  if (input.id) {
    const idx = announcements.findIndex((a) => a.id === input.id);
    if (idx >= 0) announcements[idx] = { ...announcements[idx]!, ...input };
    return announcements[idx]!;
  }
  const created: Announcement = {
    ...input,
    id: uid("an"),
    createdBy: "Priya Nair",
    publishedAt: new Date().toISOString(),
  };
  announcements.push(created);
  return created;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await latency(200);
  const idx = announcements.findIndex((a) => a.id === id);
  if (idx >= 0) announcements.splice(idx, 1);
}

export async function listTestimonials(): Promise<Testimonial[]> {
  await latency();
  return [...testimonials];
}

export async function setTestimonialApproved(id: string, approved: boolean): Promise<void> {
  await latency(200);
  const t = testimonials.find((x) => x.id === id);
  if (t) t.approved = approved;
}

export async function listFaqs(): Promise<Faq[]> {
  await latency();
  return [...faqs];
}

export async function upsertFaq(input: Omit<Faq, "id"> & { id?: string }): Promise<Faq> {
  await latency(250);
  if (input.id) {
    const idx = faqs.findIndex((f) => f.id === input.id);
    if (idx >= 0) faqs[idx] = { ...faqs[idx]!, ...input };
    return faqs[idx]!;
  }
  const created: Faq = { ...input, id: uid("fq") };
  faqs.push(created);
  return created;
}

export async function deleteFaq(id: string): Promise<void> {
  await latency(200);
  const idx = faqs.findIndex((f) => f.id === id);
  if (idx >= 0) faqs.splice(idx, 1);
}

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  await latency();
  return [...emailTemplates];
}

/* ---------- reports ---------- */

export async function getAnalytics(): Promise<{ series: typeof analyticsSeries; stats: ContentStats }> {
  await latency();
  return { series: analyticsSeries, stats: contentStats };
}

export async function listAuditLog(): Promise<AuditLogEntry[]> {
  await latency();
  return [...auditLog].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ---------- shared helpers ---------- */

export function allPlatformUsers() {
  return users;
}