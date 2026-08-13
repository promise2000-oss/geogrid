/* ============================================================
   Domain types — mirrors the Section 15 database schema 1:1,
   so the Supabase client can be dropped in without re-architecting.
   ============================================================ */

export type Role = "student" | "instructor" | "ta";
export type UserStatus = "active" | "suspended" | "deleted";

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  bio?: string;
  dob?: string;
  country?: string;
  phone?: string;
  status: UserStatus;
}

export interface Subject {
  id: string;
  name: string;
  instructorId: string;
}

export type AssignmentStatus = "draft" | "scheduled" | "published" | "archived";

export interface RubricCriterion {
  id: string;
  label: string;
  maxPoints: number;
  weight: number;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

export interface AssignmentResource {
  id: string;
  name: string;
  size: number;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string; // sanitized rich HTML
  subjectId: string;
  instructorId: string;
  dueAt: string;
  publishAt: string;
  status: AssignmentStatus;
  allowLate: boolean;
  latePenaltyPct: number;
  maxScore: number;
  rubricId?: string;
  resources: AssignmentResource[];
  assigneeIds: string[]; // empty = whole roster
}

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "graded"
  | "returned";

export interface SubmissionFile {
  id: string;
  name: string;
  size: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt?: string;
  isLate: boolean;
  version: number;
  files: SubmissionFile[];
  link?: { url: string; label: string };
  draftSavedAt?: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  gradedBy: string;
  score: number;
  maxScore: number;
  rubricScores: Record<string, number>;
  feedbackPublic: string;
  notesPrivate?: string;
  status: "draft" | "released";
  gradedAt: string;
}

export interface SubmissionComment {
  id: string;
  submissionId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export type PlanId = "free" | "premium" | "institution";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number; // cents
  priceAnnual: number; // cents
  features: string[];
  cta: string;
  highlight?: boolean;
}

export interface Subscription {
  id: string;
  userId?: string;
  planId: PlanId;
  status: "active" | "past_due" | "canceled" | "trialing";
  billingCycle: "monthly" | "annual";
  currentPeriodEnd: string;
}

export type InvoiceStatus = "paid" | "open" | "past_due" | "void";

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number; // cents
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  isDefault: boolean;
  expires: string;
}

export type NotificationCategory =
  | "assignment"
  | "payment"
  | "announcement"
  | "feedback"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationCategory;
  title: string;
  body: string;
  readAt?: string;
  channel: "in_app" | "email" | "whatsapp";
  relatedEntityId?: string;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  category: NotificationCategory;
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "free" | "premium" | "institution" | "cohort";
  publishedAt?: string;
  createdBy: string;
}

export type CalendarEventType = "deadline" | "live_class" | "reminder" | "custom";

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  type: CalendarEventType;
  startsAt: string;
  endsAt?: string;
  relatedEntityId?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  approved: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  section: "general" | "billing" | "technical";
}

export interface AuditLogEntry {
  id: string;
  actorType: "admin" | "system";
  actorId: string;
  actorName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ip: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type AdminRole = "admin" | "super_admin";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  mfaEnrolled: boolean;
  mustResetPassword: boolean;
  lastLoginAt?: string;
}

export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: UserStatus;
  enrollment: string;
  lastActiveAt: string;
  avgGrade: number;
  balance: number; // cents
  submissionCount: number;
  overdueCount: number;
}

export interface Transaction {
  id: string;
  studentName: string;
  amount: number; // cents
  status: "succeeded" | "refunded" | "failed" | "pending";
  date: string;
  method: string;
  kind: "subscription" | "refund" | "one_off";
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  expiresAt?: string;
  maxRedemptions?: number;
  redemptions: number;
}

export interface AnalyticsSeriesPoint {
  month: string; // "2026-01"
  mrr: number;
  arr: number;
  churnPct: number;
  activeStudents: number;
  newStudents: number;
  signups: number;
  conversionPct: number;
}

export interface ContentStats {
  publishedAssignments: number;
  overdueAssignments: number;
  completionRatePct: number;
  submissionsTotal: number;
  avgTurnaroundHours: number;
  avgGrade: number;
}

export interface EmailTemplate {
  key: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  description: string;
}

export interface SessionDevice {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

/* ---- API response conventions (mirrors PostgREST) ---- */
export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
}