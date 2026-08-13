/* ============================================================
   Mock database — seeded dataset mirroring Section 15 tables.
   The per-feature api modules read and mutate this store.
   Swap points: every array here maps to a Postgres table.
   ============================================================ */

import type {
  AdminProfile,
  AnalyticsSeriesPoint,
  Announcement,
  AppNotification,
  Assignment,
  AuditLogEntry,
  CalendarEvent,
  ContentStats,
  Coupon,
  EmailTemplate,
  Faq,
  Grade,
  Invoice,
  NotificationPreference,
  PaymentMethod,
  Plan,
  RosterStudent,
  Rubric,
  SessionDevice,
  Subject,
  Submission,
  SubmissionComment,
  Subscription,
  Testimonial,
  Transaction,
  UserProfile,
} from "@/lib/types";

function d(offsetDays: number, hour = 9, minute = 0): string {
  const t = new Date();
  t.setDate(t.getDate() + offsetDays);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
}

function past(offsetDays: number, hour = 9, minute = 0): string {
  return d(-offsetDays, hour, minute);
}

function monthKey(offsetMonths: number): string {
  const t = new Date();
  t.setMonth(t.getMonth() - offsetMonths);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
}

/* ---------- users & identity ---------- */

export const currentUserId = "u-student-1";

export const users: UserProfile[] = [
  {
    id: currentUserId,
    fullName: "Maya Chen",
    username: "maya.chen",
    email: "maya@geogrid.test",
    role: "student",
    bio: "A-level Biology, GCSE Maths, IB Physics. Aiming for med school.",
    dob: "2009-03-14",
    country: "GB",
    phone: "+44 7700 900123",
    status: "active",
  },
  {
    id: "u-instructor-1",
    fullName: "Daniel Okafor",
    username: "d.okafor",
    email: "daniel@geogrid.test",
    role: "instructor",
    bio: "Science & maths tutor. 8 years, 200+ students.",
    dob: "1988-06-02",
    country: "GB",
    status: "active",
  },
  {
    id: "u-ta-1",
    fullName: "Amara Diallo",
    username: "amara.d",
    email: "amara@geogrid.test",
    role: "ta",
    status: "active",
  },
  {
    id: "u-institution-1",
    fullName: "Bright Minds Tuition Centre",
    username: "brightminds",
    email: "billing@brightminds.test",
    role: "instructor",
    status: "active",
  },
];

/* ---------- subjects / rubrics ---------- */

export const subjects: Subject[] = [
  { id: "sub-bio", name: "Biology", instructorId: "u-instructor-1" },
  { id: "sub-maths", name: "Mathematics", instructorId: "u-instructor-1" },
  { id: "sub-phys", name: "Physics", instructorId: "u-instructor-1" },
];

export const rubrics: Rubric[] = [
  {
    id: "rub-1",
    name: "Standard Essay Rubric",
    criteria: [
      { id: "c-1-1", label: "Structure & organisation", maxPoints: 10, weight: 0.2 },
      { id: "c-1-2", label: "Argument & depth", maxPoints: 10, weight: 0.4 },
      { id: "c-1-3", label: "Sources & referencing", maxPoints: 5, weight: 0.2 },
      { id: "c-1-4", label: "Mechanics (spelling, grammar)", maxPoints: 5, weight: 0.2 },
    ],
  },
  {
    id: "rub-2",
    name: "Problem Set Rubric",
    criteria: [
      { id: "c-2-1", label: "Method & working", maxPoints: 10, weight: 0.4 },
      { id: "c-2-2", label: "Accuracy", maxPoints: 10, weight: 0.4 },
      { id: "c-2-3", label: "Presentation & units", maxPoints: 5, weight: 0.2 },
    ],
  },
];

/* ---------- assignments ---------- */

export const assignments: Assignment[] = [
  {
    id: "a-1",
    title: "Cell Biology Essay — Unit 3",
    instructions:
      "<p>Write a <strong>800–1000 word</strong> essay on how the endomembrane system coordinates protein synthesis, modification, and export.</p><ul><li>Cover at least two experimental techniques</li><li>Reference at least three peer-reviewed sources</li><li>Use Harvard referencing</li></ul><p>Focus on depth over breadth — a single well-argued pathway beats a list of facts.</p>",
    subjectId: "sub-bio",
    instructorId: "u-instructor-1",
    dueAt: d(2, 17),
    publishAt: past(6),
    status: "published",
    allowLate: true,
    latePenaltyPct: 10,
    maxScore: 30,
    rubricId: "rub-1",
    resources: [
      { id: "r-1", name: "rubric-essay.pdf", size: 184_320 },
      { id: "r-2", name: "sample-essay-9.pdf", size: 262_144 },
    ],
    assigneeIds: [],
  },
  {
    id: "a-2",
    title: "Photosynthesis & Respiration Lab Write-up",
    instructions:
      "<p>Submit your lab write-up from the <em>rate of photosynthesis</em> practical: hypothesis, method, results table, and analysis of the light-intensity curve.</p>",
    subjectId: "sub-bio",
    instructorId: "u-instructor-1",
    dueAt: past(3),
    publishAt: past(20),
    status: "published",
    allowLate: true,
    latePenaltyPct: 5,
    maxScore: 30,
    rubricId: "rub-1",
    resources: [{ id: "r-3", name: "practical-sheet.pdf", size: 921_600 }],
    assigneeIds: [],
  },
  {
    id: "a-3",
    title: "Quadratic Functions Problem Set",
    instructions:
      "<p>Complete all 12 problems. Show full working — marks are awarded for method, not just the answer. Sketch each curve on the grids provided.</p>",
    subjectId: "sub-maths",
    instructorId: "u-instructor-1",
    dueAt: d(5, 17),
    publishAt: past(9),
    status: "published",
    allowLate: false,
    latePenaltyPct: 0,
    maxScore: 25,
    rubricId: "rub-2",
    resources: [{ id: "r-4", name: "quadratics-ps.pdf", size: 340_787 }],
    assigneeIds: [],
  },
  {
    id: "a-4",
    title: "Integration by Parts — Extended Practice",
    instructions:
      "<p>Ten integrals of increasing difficulty, ending with a proof question. Submit as a single PDF of handwritten or typed working.</p>",
    subjectId: "sub-maths",
    instructorId: "u-instructor-1",
    dueAt: d(1, 17),
    publishAt: past(11),
    status: "published",
    allowLate: true,
    latePenaltyPct: 10,
    maxScore: 25,
    rubricId: "rub-2",
    resources: [{ id: "r-5", name: "integration-practice.pdf", size: 205_824 }],
    assigneeIds: [],
  },
  {
    id: "a-5",
    title: "Oscillations & Waves Mini-Exam",
    instructions:
      "<p>Closed-book style mini-exam: SHM equations, wave properties, superposition. Time yourself — 45 minutes, as agreed.</p>",
    subjectId: "sub-phys",
    instructorId: "u-instructor-1",
    dueAt: past(7),
    publishAt: past(14),
    status: "published",
    allowLate: true,
    latePenaltyPct: 5,
    maxScore: 25,
    rubricId: "rub-2",
    resources: [{ id: "r-6", name: "mini-exam-paper.pdf", size: 458_752 }],
    assigneeIds: [],
  },
  {
    id: "a-6",
    title: "Thermodynamics Reading Summary",
    instructions:
      "<p>Summarise chapters 4–5 of the course reader in under 400 words, and list three examinable concepts per chapter.</p>",
    subjectId: "sub-phys",
    instructorId: "u-instructor-1",
    dueAt: d(12, 17),
    publishAt: d(3, 9),
    status: "scheduled",
    allowLate: true,
    latePenaltyPct: 10,
    maxScore: 30,
    rubricId: "rub-1",
    resources: [],
    assigneeIds: [],
  },
  {
    id: "a-7",
    title: "Genetics Problem Set 2",
    instructions: "<p>Draft — not yet visible to students.</p>",
    subjectId: "sub-bio",
    instructorId: "u-instructor-1",
    dueAt: d(8, 17),
    publishAt: d(4, 9),
    status: "draft",
    allowLate: false,
    latePenaltyPct: 0,
    maxScore: 25,
    rubricId: "rub-2",
    resources: [],
    assigneeIds: [],
  },
];

/* ---------- submissions & grades ---------- */

export const submissions: Submission[] = [
  {
    id: "s-1",
    assignmentId: "a-2",
    studentId: currentUserId,
    status: "graded",
    submittedAt: past(2, 20),
    isLate: false,
    version: 1,
    files: [{ id: "f-1", name: "photosynthesis-lab-writeup.pdf", size: 1_572_864 }],
  },
  {
    id: "s-2",
    assignmentId: "a-4",
    studentId: currentUserId,
    status: "under_review",
    submittedAt: d(0, 8),
    isLate: false,
    version: 2,
    files: [{ id: "f-2", name: "integration-practice-v2.pdf", size: 2_097_152 }],
    link: { url: "https://docs.google.com/document/d/demo123", label: "Working draft (Google Docs)" },
  },
  {
    id: "s-3",
    assignmentId: "a-5",
    studentId: currentUserId,
    status: "returned",
    submittedAt: past(6, 19),
    isLate: true,
    version: 1,
    files: [{ id: "f-3", name: "mini-exam-scan.pdf", size: 3_145_728 }],
  },
  {
    id: "s-4",
    assignmentId: "a-3",
    studentId: currentUserId,
    status: "draft",
    version: 1,
    isLate: false,
    files: [{ id: "f-4", name: "quadratics-ps-working.pdf", size: 1_048_576 }],
    draftSavedAt: d(-0, 8),
  },
];

export const grades: Grade[] = [
  {
    id: "g-1",
    submissionId: "s-1",
    gradedBy: "u-instructor-1",
    score: 24,
    maxScore: 30,
    rubricScores: { "c-1-1": 8, "c-1-2": 9, "c-1-3": 4, "c-1-4": 3 },
    feedbackPublic:
      "Strong structure and a confident argument — the light-intensity analysis was the best part. The results table needs units on every column, and a couple of referencing errors in the bibliography. Fix those and this is a high-A essay.",
    status: "released",
    gradedAt: past(1, 15),
  },
  {
    id: "g-2",
    submissionId: "s-3",
    gradedBy: "u-instructor-1",
    score: 15,
    maxScore: 25,
    rubricScores: { "c-2-1": 7, "c-2-2": 5, "c-2-3": 3 },
    feedbackPublic:
      "Method marks are solid, but Q3 and Q7 have sign errors — redo those two and resubmit. Also label your axes next time; two marks went to presentation.",
    status: "released",
    gradedAt: past(5, 12),
  },
];

export const submissionComments: SubmissionComment[] = [
  {
    id: "cm-1",
    submissionId: "s-2",
    authorId: "u-instructor-1",
    authorName: "Daniel Okafor",
    body: "Saw your v2 — the u-substitution on Q5 is much cleaner. Will grade by tomorrow evening.",
    createdAt: d(0, 10),
  },
  {
    id: "cm-2",
    submissionId: "s-2",
    authorId: currentUserId,
    authorName: "Maya Chen",
    body: "Thank you! I redid the proof question after your hint.",
    createdAt: d(0, 11),
  },
];

/* ---------- billing ---------- */

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the structure before you commit.",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "Up to 3 active assignments",
      "500 MB file storage",
      "Best-effort grading turnaround",
      "1 seat",
      "Email support",
    ],
    cta: "Start free trial",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For serious students and solo tutors.",
    priceMonthly: 1900,
    priceAnnual: 19000,
    features: [
      "Unlimited active assignments",
      "10 GB file storage",
      "Priority grading turnaround",
      "1 seat",
      "Email + WhatsApp support",
      "Full progress & trend reports",
      "Custom rubrics",
    ],
    cta: "Go Premium",
    highlight: true,
  },
  {
    id: "institution",
    name: "Institution",
    tagline: "Multi-seat, admin-managed, custom-branded.",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "Unlimited active assignments",
      "Pooled storage per contract",
      "Priority + dedicated support",
      "Bulk, admin-managed seats",
      "Custom branding",
      "Roll-up billing & reporting",
    ],
    cta: "Contact sales",
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "sub-1",
    userId: currentUserId,
    planId: "premium",
    status: "active",
    billingCycle: "monthly",
    currentPeriodEnd: d(18),
  },
];

export const invoices: Invoice[] = [
  { id: "inv-2026-06", subscriptionId: "sub-1", amount: 1900, status: "past_due", issuedAt: past(12), paidAt: undefined },
  { id: "inv-2026-05", subscriptionId: "sub-1", amount: 1900, status: "paid", issuedAt: past(42), paidAt: past(42, 10) },
  { id: "inv-2026-04", subscriptionId: "sub-1", amount: 1900, status: "paid", issuedAt: past(73), paidAt: past(73, 9) },
  { id: "inv-2026-03", subscriptionId: "sub-1", amount: 1900, status: "paid", issuedAt: past(103), paidAt: past(103, 12) },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm-1", userId: currentUserId, brand: "Visa", last4: "4242", isDefault: true, expires: "04/28" },
  { id: "pm-2", userId: currentUserId, brand: "Mastercard", last4: "5555", isDefault: false, expires: "11/27" },
];

/* ---------- notifications ---------- */

export const notifications: AppNotification[] = [
  {
    id: "n-1",
    userId: currentUserId,
    type: "feedback",
    title: "Lab write-up graded",
    body: "Daniel graded your Photosynthesis & Respiration lab write-up: 24/30. See the rubric breakdown and feedback.",
    readAt: past(1, 16),
    channel: "in_app",
    relatedEntityId: "a-2",
    createdAt: past(1, 15, 30),
  },
  {
    id: "n-2",
    userId: currentUserId,
    type: "payment",
    title: "June invoice is past due",
    body: "Your $19.00 invoice was issued 12 days ago and is still unpaid. Pay now to keep Premium features active.",
    relatedEntityId: "inv-2026-06",
    createdAt: past(1, 9),
    channel: "in_app",
  },
  {
    id: "n-3",
    userId: currentUserId,
    type: "assignment",
    title: "Deadline tomorrow",
    body: "Integration by Parts — Extended Practice is due tomorrow at 5:00 PM. Your submission is under review.",
    relatedEntityId: "a-4",
    createdAt: past(0, 20),
    channel: "in_app",
  },
  {
    id: "n-4",
    userId: currentUserId,
    type: "feedback",
    title: "New comment on your submission",
    body: "Daniel replied to your comment on Integration by Parts: \"Saw your v2…\"",
    relatedEntityId: "a-4",
    createdAt: d(0, 10),
    channel: "email",
  },
  {
    id: "n-5",
    userId: currentUserId,
    type: "announcement",
    title: "June revision schedule is live",
    body: "Group revision sessions for the summer exams are now bookable. Two live classes added to your calendar.",
    createdAt: past(2, 12),
    channel: "in_app",
  },
  {
    id: "n-6",
    userId: currentUserId,
    type: "payment",
    title: "Payment received",
    body: "Your May invoice of $19.00 was paid successfully. Receipt available in Payments.",
    readAt: past(42, 11),
    relatedEntityId: "inv-2026-05",
    createdAt: past(42, 10, 30),
    channel: "email",
  },
  {
    id: "n-7",
    userId: currentUserId,
    type: "assignment",
    title: "New assignment published",
    body: "Cell Biology Essay — Unit 3 is now open. Due in 2 days.",
    relatedEntityId: "a-1",
    createdAt: past(6, 9),
    channel: "whatsapp",
  },
  {
    id: "n-8",
    userId: currentUserId,
    type: "system",
    title: "Email verified",
    body: "Your email address was verified. You now have full access to GeoGrid.",
    readAt: past(30, 14),
    createdAt: past(30, 14),
    channel: "in_app",
  },
];

export const notificationPreferences: NotificationPreference[] = [
  { userId: currentUserId, category: "assignment", inApp: true, email: true, whatsapp: true },
  { userId: currentUserId, category: "payment", inApp: true, email: true, whatsapp: false },
  { userId: currentUserId, category: "announcement", inApp: true, email: true, whatsapp: true },
  { userId: currentUserId, category: "feedback", inApp: true, email: true, whatsapp: true },
  { userId: currentUserId, category: "system", inApp: true, email: false, whatsapp: false },
];

/* ---------- calendar ---------- */

export const calendarEvents: CalendarEvent[] = [
  { id: "ev-1", userId: currentUserId, title: "Cell Biology Essay due", type: "deadline", startsAt: d(2, 17), relatedEntityId: "a-1" },
  { id: "ev-2", userId: currentUserId, title: "Integration by Parts due", type: "deadline", startsAt: d(1, 17), relatedEntityId: "a-4" },
  { id: "ev-3", userId: currentUserId, title: "Quadratic Functions due", type: "deadline", startsAt: d(5, 17), relatedEntityId: "a-3" },
  { id: "ev-4", userId: currentUserId, title: "Live class — Biology revision", type: "live_class", startsAt: d(3, 18), endsAt: d(3, 19) },
  { id: "ev-5", userId: currentUserId, title: "Live class — Maths problem clinic", type: "live_class", startsAt: d(9, 17), endsAt: d(9, 18) },
  { id: "ev-6", userId: currentUserId, title: "Book June review session", type: "reminder", startsAt: d(6, 12) },
  { id: "ev-7", userId: currentUserId, title: "Half-term break", type: "custom", startsAt: d(24, 0), endsAt: d(31, 0) },
];

/* ---------- announcements / content ---------- */

export const announcements: Announcement[] = [
  {
    id: "an-1",
    title: "June revision schedule is live",
    body: "Summer-exam revision sessions are now bookable in the calendar. Premium students get priority slots.",
    audience: "all",
    publishedAt: past(2, 12),
    createdBy: "Daniel Okafor",
  },
  {
    id: "an-2",
    title: "New rubric: Extended Problem Sets",
    body: "From July, all extended problem sets use the updated 25-point rubric. Nothing changes for already-graded work.",
    audience: "premium",
    publishedAt: past(9, 10),
    createdBy: "Daniel Okafor",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote:
      "Assignments stopped disappearing in the chat. My students hand in work on time, and parents can actually see progress.",
    author: "Placeholder — real tutor name TBD",
    role: "Tutor, 120+ students",
    approved: true,
  },
  {
    id: "t-2",
    quote:
      "The grade breakdown made it obvious where my daughter was losing marks. We fixed it in a month.",
    author: "Placeholder — real parent name TBD",
    role: "Parent of an A-level student",
    approved: false,
  },
  {
    id: "t-3",
    quote:
      "We run three centres on GeoGrid Institution. Billing and seat management used to take a full day a month.",
    author: "Placeholder — real centre director TBD",
    role: "Director, tuition centre",
    approved: false,
  },
];

export const faqs: Faq[] = [
  {
    id: "fq-1",
    question: "Do I still talk to my tutor on WhatsApp?",
    answer:
      "Yes — that's the point. Conversation stays on WhatsApp. GeoGrid handles the structured parts WhatsApp can't: submitting assignments, grading against rubrics, invoices, and progress records.",
    section: "general",
  },
  {
    id: "fq-2",
    question: "How does my tutor invite me?",
    answer:
      "Your tutor sends you an invite link on WhatsApp. You create an account, verify your email, and you're in — usually under two minutes.",
    section: "general",
  },
  {
    id: "fq-3",
    question: "What happens if I cancel Premium?",
    answer:
      "You keep access until the end of your billing period, then drop to the Free plan. Your files and grades are never deleted unless you delete your account.",
    section: "billing",
  },
  {
    id: "fq-4",
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes, from Settings → Account → Subscription. Annual billing is two months free, and you're prorated when you upgrade mid-cycle.",
    section: "billing",
  },
  {
    id: "fq-5",
    question: "Which file types can I submit?",
    answer:
      "PDF, images, Word, Excel, PowerPoint, plain text, and code files up to 100 MB. Executables and archives with executables are blocked for safety.",
    section: "technical",
  },
  {
    id: "fq-6",
    question: "Is my data private?",
    answer:
      "Yes. Files live in private storage with signed, time-limited URLs — never public buckets. See our Privacy Policy for the full breakdown, including retention windows.",
    section: "technical",
  },
];

export const emailTemplates: EmailTemplate[] = [
  {
    key: "grade_released",
    description: "Sent when a grade is released to a student.",
    subject: "{{student_name}} — your grade for {{assignment_title}} is ready",
    bodyHtml:
      "<p>Hi {{student_name}},</p><p>Your submission for <strong>{{assignment_title}}</strong> has been graded: <strong>{{score}}/{{max_score}}</strong>.</p><p>View the rubric breakdown and feedback: {{grade_url}}</p>",
    variables: ["student_name", "assignment_title", "score", "max_score", "grade_url"],
  },
  {
    key: "invoice_past_due",
    description: "Sent when an invoice enters past-due status.",
    subject: "Your GeoGrid invoice {{invoice_number}} is past due",
    bodyHtml:
      "<p>Hi {{student_name}},</p><p>Your invoice of <strong>{{amount}}</strong> ({{invoice_number}}) is {{days_overdue}} days overdue. Pay it to keep {{plan_name}} features active.</p><p>{{pay_url}}</p>",
    variables: ["student_name", "invoice_number", "amount", "days_overdue", "plan_name", "pay_url"],
  },
  {
    key: "assignment_due_reminder",
    description: "Sent 24h before an assignment deadline.",
    subject: "Due tomorrow: {{assignment_title}}",
    bodyHtml:
      "<p>Hi {{student_name}},</p><p><strong>{{assignment_title}}</strong> is due tomorrow at {{due_time}}. You can submit now: {{assignment_url}}</p>",
    variables: ["student_name", "assignment_title", "due_time", "assignment_url"],
  },
  {
    key: "welcome",
    description: "Sent after email verification.",
    subject: "Welcome to GeoGrid, {{student_name}}",
    bodyHtml:
      "<p>Hi {{student_name}},</p><p>Your account is verified. Start with your dashboard: {{dashboard_url}}</p>",
    variables: ["student_name", "dashboard_url"],
  },
];

/* ---------- admin / governance ---------- */

export const admins: AdminProfile[] = [
  {
    id: "adm-1",
    name: "Ade Bello",
    email: "super@geogrid.test",
    role: "super_admin",
    mfaEnrolled: true,
    mustResetPassword: false,
    lastLoginAt: past(0, 7),
  },
  {
    id: "adm-2",
    name: "Priya Nair",
    email: "ops@geogrid.test",
    role: "admin",
    mfaEnrolled: true,
    mustResetPassword: false,
    lastLoginAt: past(1, 9),
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: "al-1",
    actorType: "admin",
    actorId: "adm-2",
    actorName: "Priya Nair",
    action: "refund.issued",
    targetType: "invoice",
    targetId: "inv-2026-05",
    ip: "86.15.204.11",
    userAgent: "Chrome 138 / macOS",
    metadata: { amount: 1900, reason: "customer_request" },
    createdAt: past(0, 11),
  },
  {
    id: "al-2",
    actorType: "admin",
    actorId: "adm-2",
    actorName: "Priya Nair",
    action: "student.suspended",
    targetType: "student",
    targetId: "st-09",
    ip: "86.15.204.11",
    userAgent: "Chrome 138 / macOS",
    metadata: { reason: "payment_dispute" },
    createdAt: past(1, 14),
  },
  {
    id: "al-3",
    actorType: "system",
    actorId: "system",
    actorName: "system",
    action: "auth.login_failed",
    targetType: "admin",
    targetId: "adm-2",
    ip: "194.26.77.3",
    userAgent: "Firefox 140 / Windows",
    createdAt: past(1, 9, 10),
  },
  {
    id: "al-4",
    actorType: "admin",
    actorId: "adm-1",
    actorName: "Ade Bello",
    action: "rbac.role_changed",
    targetType: "admin",
    targetId: "adm-2",
    ip: "88.211.44.9",
    userAgent: "Chrome 138 / Linux",
    metadata: { from: "admin", to: "admin" },
    createdAt: past(3, 10),
  },
  {
    id: "al-5",
    actorType: "admin",
    actorId: "adm-1",
    actorName: "Ade Bello",
    action: "admin.provisioned",
    targetType: "admin",
    targetId: "adm-2",
    ip: "88.211.44.9",
    userAgent: "Chrome 138 / Linux",
    createdAt: past(4, 16),
  },
  {
    id: "al-6",
    actorType: "system",
    actorId: "system",
    actorName: "system",
    action: "whatsapp.message_sent",
    targetType: "notification",
    targetId: "n-7",
    ip: "internal",
    userAgent: "edge-function",
    metadata: { template: "assignment_due_reminder" },
    createdAt: past(6, 9),
  },
  {
    id: "al-7",
    actorType: "admin",
    actorId: "adm-2",
    actorName: "Priya Nair",
    action: "grade.released",
    targetType: "submission",
    targetId: "s-1",
    ip: "86.15.204.11",
    userAgent: "Chrome 138 / macOS",
    createdAt: past(1, 15),
  },
  {
    id: "al-8",
    actorType: "admin",
    actorId: "adm-1",
    actorName: "Ade Bello",
    action: "impersonation.started",
    targetType: "student",
    targetId: "st-03",
    ip: "88.211.44.9",
    userAgent: "Chrome 138 / Linux",
    createdAt: past(8, 13),
  },
  {
    id: "al-9",
    actorType: "system",
    actorId: "system",
    actorName: "system",
    action: "security.ip_blocked",
    targetType: "admin",
    targetId: "adm-2",
    ip: "194.26.77.3",
    userAgent: "Firefox 140 / Windows",
    metadata: { policy: "ip_allowlist" },
    createdAt: past(1, 9, 30),
  },
  {
    id: "al-10",
    actorType: "admin",
    actorId: "adm-1",
    actorName: "Ade Bello",
    action: "auth.login_success",
    targetType: "admin",
    targetId: "adm-1",
    ip: "88.211.44.9",
    userAgent: "Chrome 138 / Linux",
    createdAt: past(0, 7),
  },
];

/* ---------- console: roster, transactions, analytics ---------- */

const ROSTER_NAMES: [string, string, number, number, number][] = [
  ["Lucas Meyer", "lucas@example.test", 82, 0, 1],
  ["Zainab Ali", "zainab@example.test", 91, 0, 0],
  ["Oliver Reid", "oliver@example.test", 67, 1900, 2],
  ["Sofia Rossi", "sofia@example.test", 88, 0, 0],
  ["Noah Kim", "noah@example.test", 74, 1900, 1],
  ["Emma Larsson", "emma@example.test", 95, 0, 0],
  ["Arjun Patel", "arjun@example.test", 79, 0, 0],
  ["Isabelle Fontaine", "isabelle@example.test", 85, 0, 1],
  ["Tomás Silva", "tomas@example.test", 58, 3800, 3],
  ["Hana Yoshida", "hana@example.test", 90, 0, 0],
  ["Leo O'Connell", "leo@example.test", 72, 1900, 1],
  ["Freya Johansen", "freya@example.test", 87, 0, 0],
];

export const rosterStudents: RosterStudent[] = ROSTER_NAMES.map(([name, email, avg, balance, overdue], i) => ({
  id: `st-${String(i + 1).padStart(2, "0")}`,
  name,
  email,
  status: i === 8 ? "suspended" : "active",
  enrollment: past(60 + i * 7),
  lastActiveAt: past(i % 3),
  avgGrade: avg,
  balance,
  submissionCount: 8 + (i % 5),
  overdueCount: overdue,
}));

const SUB_QUEUE: { studentId: string; assignmentId: string; status: Submission["status"] }[] = [
  { studentId: "st-02", assignmentId: "a-1", status: "under_review" },
  { studentId: "st-04", assignmentId: "a-4", status: "under_review" },
  { studentId: "st-06", assignmentId: "a-1", status: "under_review" },
  { studentId: "st-10", assignmentId: "a-3", status: "graded" },
  { studentId: "st-01", assignmentId: "a-4", status: "submitted" },
  { studentId: "st-07", assignmentId: "a-5", status: "submitted" },
  { studentId: "st-11", assignmentId: "a-1", status: "submitted" },
  { studentId: "st-03", assignmentId: "a-4", status: "submitted" },
  { studentId: "st-12", assignmentId: "a-5", status: "graded" },
  { studentId: "st-05", assignmentId: "a-1", status: "under_review" },
  { studentId: "st-09", assignmentId: "a-3", status: "returned" },
  { studentId: "st-08", assignmentId: "a-5", status: "returned" },
];

export const rosterSubmissions: Submission[] = SUB_QUEUE.map((s, i) => ({
  id: `rs-${i + 1}`,
  assignmentId: s.assignmentId,
  studentId: s.studentId,
  status: s.status,
  submittedAt: past(i + 1, 16),
  isLate: i % 3 === 0,
  version: 1 + (i % 2),
  files: [
    {
      id: `rf-${i + 1}`,
      name: `${s.studentId}-submission-${s.assignmentId}.pdf`,
      size: 1_000_000 + i * 131_072,
    },
  ],
}));

export const transactions: Transaction[] = [
  { id: "tx-01", studentName: "Zainab Ali", amount: 1900, status: "succeeded", date: past(0, 9), method: "Visa •• 4242", kind: "subscription" },
  { id: "tx-02", studentName: "Emma Larsson", amount: 1900, status: "succeeded", date: past(1, 15), method: "Mastercard •• 5555", kind: "subscription" },
  { id: "tx-03", studentName: "Oliver Reid", amount: 1900, status: "succeeded", date: past(2, 10), method: "Visa •• 4242", kind: "subscription" },
  { id: "tx-04", studentName: "Tomás Silva", amount: 1900, status: "failed", date: past(3, 18), method: "Visa •• 1111", kind: "subscription" },
  { id: "tx-05", studentName: "Bright Minds Tuition Centre", amount: 24000, status: "succeeded", date: past(4, 9), method: "Bank transfer", kind: "subscription" },
  { id: "tx-06", studentName: "Oliver Reid", amount: 1900, status: "refunded", date: past(5, 11), method: "Visa •• 4242", kind: "refund" },
  { id: "tx-07", studentName: "Leo O'Connell", amount: 1900, status: "succeeded", date: past(6, 13), method: "Amex •• 3005", kind: "subscription" },
  { id: "tx-08", studentName: "Hana Yoshida", amount: 1900, status: "succeeded", date: past(7, 10), method: "Visa •• 4242", kind: "subscription" },
];

export const coupons: Coupon[] = [
  { id: "cp-1", code: "SUMMER25", discountType: "percent", discountValue: 25, expiresAt: d(45), maxRedemptions: 200, redemptions: 61 },
  { id: "cp-2", code: "REFER10", discountType: "fixed", discountValue: 1000, maxRedemptions: undefined, redemptions: 18 },
];

export const analyticsSeries: AnalyticsSeriesPoint[] = Array.from({ length: 12 }, (_, i) => {
  const mrr = Math.round(4200 + i * 540 + (i % 3) * 180);
  return {
    month: monthKey(11 - i),
    mrr,
    arr: mrr * 12,
    churnPct: +(2.1 + (i % 4) * 0.4).toFixed(1),
    activeStudents: Math.round(140 + i * 22),
    newStudents: Math.round(9 + (i % 5) * 3),
    signups: Math.round(40 + i * 8),
    conversionPct: +(11 + (i % 4) * 1.5).toFixed(1),
  };
});

export const contentStats: ContentStats = {
  publishedAssignments: 46,
  overdueAssignments: 7,
  completionRatePct: 84.6,
  submissionsTotal: 412,
  avgTurnaroundHours: 21.4,
  avgGrade: 78.2,
};

export const sessionDevices: SessionDevice[] = [
  { id: "dev-1", device: "MacBook Pro 14\"", browser: "Chrome 138", location: "London, UK", lastActiveAt: d(0, 9), current: true },
  { id: "dev-2", device: "iPhone 16", browser: "Safari 18", location: "London, UK", lastActiveAt: past(1, 22), current: false },
  { id: "dev-3", device: "Windows PC", browser: "Edge 138", location: "Manchester, UK", lastActiveAt: past(6, 15), current: false },
];

/* ---------- demo constants for auth flows ---------- */

export const DEMO_STUDENT_EMAIL = "maya@geogrid.test";
export const DEMO_TOTP_CODE = "123456";