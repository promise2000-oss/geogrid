import { Compass, Handshake, HeartHandshake, ShieldCheck } from "lucide-react";
import { useSeo } from "@/lib/seo";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Academic integrity is the product",
    body: "A grade is a judgment a tutor owns and a student can trust. GeoGrid exists to make grading honest, transparent, and defensible — never to automate it into an afterthought.",
  },
  {
    icon: Handshake,
    title: "Tutor-first economics",
    body: "Tutors set the terms of their business. GeoGrid takes a subscription from the tutor, never a cut of lesson revenue, and never inserts itself between a tutor and their student.",
  },
  {
    icon: Compass,
    title: "Calm reliability",
    body: "Students and parents hand over real academic records. That deserves boring, dependable software: no surprise pricing, no disappearing files, no games with attention.",
  },
];

export default function About() {
  useSeo("About", "GeoGrid's mission, vision, and values — the academic operating system for WhatsApp-based tutoring.");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About</p>
        <h1 className="display-tight mt-3 font-display text-4xl font-semibold">
          WhatsApp is where tutoring happens. It was never meant to be where it's run.
        </h1>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-6 text-muted-foreground">
        <p>
          Independent tutors and small tutoring businesses run their relationships on WhatsApp because that's where
          their students already are. But a chat thread has no structure: no clean way to hand in an assignment, no
          rubric to grade against, no invoice that parents accept, no record that survives a phone upgrade.
        </p>
        <p>
          GeoGrid is the layer that gives that relationship structure — without asking anyone to leave WhatsApp for the
          conversation itself. We built the operating system for the parts of tutoring that spreadsheets and chat
          scrollback were never good at: structured submission and grading, subscriptions and billing, and learning
          records.
        </p>
        <p>
          <em>Our story placeholder — real company history and founding team details are filled in before launch.</em>
        </p>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-lg border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <v.icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-lg border bg-muted/30 p-8">
        <div className="flex items-start gap-3">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="font-display text-lg font-semibold">Mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Make every tutoring relationship — student, tutor, and parent — run on a clear, structured academic
              record, so trust is built on evidence instead of memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}