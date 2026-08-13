import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  Check,
  ClipboardCheck,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSeo } from "@/lib/seo";
import { faqs } from "@/lib/mock/db";
import { WHATSAPP_SUPPORT } from "@/lib/config";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Assignments & grading",
    body: "Structured submission, rubric-based grading, and feedback your students can actually act on — no more scrolling WhatsApp for last week's essay.",
  },
  {
    icon: Wallet,
    title: "Payments & subscriptions",
    body: "Invoices, payment methods, and plan management handled by Stripe underneath. You teach; GeoGrid collects.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    body: "Grades, trends, and a feedback repository in one place. A parent-ready progress record without the spreadsheet archaeology.",
  },
  {
    icon: Bell,
    title: "Notifications that nudge",
    body: "Deadline and payment reminders on WhatsApp, email, and in-app — each category toggleable per channel.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-native workflow",
    body: "Conversation stays on WhatsApp. GeoGrid handles the structured parts WhatsApp can't, and links back out when needed.",
  },
  {
    icon: ShieldCheck,
    title: "Admin & institution tools",
    body: "Multi-seat management, roll-up billing, role-based access, and an audit trail for every sensitive action.",
  },
];

const STEPS = [
  { step: "01", title: "Invite on WhatsApp", body: "Your tutor sends you an invite link right in the chat you already use." },
  { step: "02", title: "Join GeoGrid", body: "Create an account and verify your email — under two minutes, no app to install." },
  { step: "03", title: "Assignments flow through GeoGrid", body: "Submit work, get graded against a clear rubric, track feedback and versions." },
  { step: "04", title: "Progress and payments track themselves", body: "Grades, trends, invoices, and receipts in one structured record." },
];

const STATS = [
  { value: "—", label: "Assignments submitted (placeholder — real numbers before launch)" },
  { value: "—", label: "Grading turnaround, hours (placeholder)" },
  { value: "—", label: "Tutors on platform (placeholder)" },
  { value: "—", label: "Average grade improvement (placeholder)" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{children}</p>
  );
}

export default function Home() {
  useSeo(
    undefined,
    "GeoGrid is the academic operating system for WhatsApp-based tutoring — structured assignment submission and grading, subscriptions and billing, and learning records.",
  );

  return (
    <div>
      {/* Hero — the one signature moment: a grid that settles into alignment */}
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" aria-hidden />
        <div className="hero-fade-in relative mx-auto max-w-4xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
          <Badge variant="secondary" className="mb-6">
            Built for WhatsApp-based tutoring
          </Badge>
          <h1 className="display-tight font-display text-4xl font-semibold leading-tight sm:text-6xl">
            The academic operating system for{" "}
            <span className="text-primary">WhatsApp tutoring</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            GeoGrid handles everything WhatsApp can't — structured assignment submission and grading, subscriptions
            and billing, and learning records — so your WhatsApp threads stay about teaching, not paperwork.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/register">Start free trial <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works"><PlayCircle className="h-4 w-4" /> See how it works</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free plan · No card required · Your tutor invites you</p>
        </div>
      </section>

      {/* Social proof strip — placeholder structure */}
      <section aria-label="Trusted by" className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by independent tutors and tuition centres
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["Apex Tutors", "MathLab", "Bright Minds", "Sciencia", "Katalyst", "Oak Academy"].map((name) => (
              <span key={name} className="font-display text-lg font-semibold text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="product" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionLabel>What GeoGrid does</SectionLabel>
        <h2 className="display-tight max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
          The structure of a real academic record, without leaving WhatsApp behind
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="display-tight max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            From WhatsApp chaos to a structured academic record in four steps
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="relative rounded-lg border bg-card p-6">
                <span className="mono-data text-sm font-semibold text-primary">{s.step}</span>
                <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GeoGrid */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionLabel>Why GeoGrid</SectionLabel>
        <h2 className="display-tight max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
          Not another LMS. Not another spreadsheet.
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold">vs. generic LMS platforms</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "No rebuilding the relationship — conversation stays in WhatsApp, where it already works",
                  "No courses, no enrollments, no admin theatre — just assignments, grades, and payments",
                  "Built for one-to-one and small-group tutoring, not lecture-hall cohorts",
                ].map((point) => (
                  <li key={point} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold">vs. spreadsheets and chat scrollback</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Submissions with version history, not a photo lost between memes",
                  "Grading against a rubric with feedback students can find again",
                  "Invoices and receipts that parents and institutions actually accept",
                  "A progress record that survives a tutor changing devices",
                ].map((point) => (
                  <li key={point} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats — clearly-labeled placeholders */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-6">
              <p className="mono-data font-display text-4xl font-semibold text-primary">{s.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — placeholder content, flagged */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="display-tight font-display text-3xl font-semibold">What tutors and students say</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Placeholder structure — real, permission-cleared quotes ship before launch.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { quote: "Assignments stopped disappearing in the chat. My students hand in work on time, and parents can actually see progress.", who: "Placeholder — real tutor name TBD" },
              { quote: "The grade breakdown made it obvious where my daughter was losing marks. We fixed it in a month.", who: "Placeholder — real parent name TBD" },
              { quote: "We run three centres on GeoGrid. Billing and seat management used to take a full day a month.", who: "Placeholder — real centre director TBD" },
            ].map((t) => (
              <Card key={t.who}>
                <CardContent className="p-6">
                  <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden />
                  <blockquote className="mt-3 text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <p className="mt-4 text-xs font-medium text-muted-foreground">{t.who}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="display-tight font-display text-3xl font-semibold">Start free. Upgrade when it pays for itself.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", tag: "Try the structure before you commit.", cta: "Start free trial" },
            { name: "Premium", price: "$19/mo", tag: "Unlimited assignments, priority grading, 10 GB.", cta: "Go Premium", highlight: true },
            { name: "Institution", price: "Custom", tag: "Multi-seat, admin-managed, custom-branded.", cta: "Contact sales" },
          ].map((p) => (
            <Card key={p.name} className={p.highlight ? "border-primary shadow-md" : ""}>
              <CardContent className="flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  {p.highlight && <Badge>Most popular</Badge>}
                </div>
                <p className="mono-data mt-3 text-3xl font-semibold">{p.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.tag}</p>
                <Button asChild variant={p.highlight ? "default" : "outline"} className="mt-5">
                  <Link to={p.name === "Institution" ? "/contact" : `/pricing?plan=${p.name.toLowerCase()}`}>{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/pricing" className="text-primary hover:underline">Compare all plans</Link> ·{" "}
          <Link to="/contact" className="text-primary hover:underline">Contact sales</Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="display-tight font-display text-3xl font-semibold">Common questions</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.filter((f) => f.section === "general" || f.section === "billing").map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="display-tight font-display text-3xl font-semibold">Teaching notes, once a month</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            A short email about tutoring ops — deadlines, grading, and growing a tutoring business. No spam.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).elements.namedItem("email") as HTMLInputElement;
              input.value = "";
              toast.success("You're on the list — welcome aboard.");
            }}
          >
            <input
              type="email"
              name="email"
              required
              aria-label="Email address"
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="lg">Subscribe</Button>
          </form>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="display-tight font-display text-2xl font-semibold">Prefer to ask on WhatsApp?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Chat with our support team the way your students chat with you.</p>
            </div>
            <Button asChild variant="default" size="lg">
              <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}