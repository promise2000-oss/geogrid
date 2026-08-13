import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalScaffoldProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** Structural scaffold for legal pages — placeholder text, not legal advice.
 *  A qualified attorney must review before launch (SRD Section 5 callout). */
export function LegalScaffold({ title, updated, intro, sections }: LegalScaffoldProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
      <h1 className="display-tight mt-3 font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>
      <Alert variant="warning" className="mt-6">
        <AlertIcon variant="warning" />
        <AlertTitle>This is a structural scaffold, not legal advice</AlertTitle>
        <AlertDescription>
          Placeholder text below marks the sections this policy must contain. Have a qualified attorney — ideally with
          FERPA/COPPA or GDPR experience, given GeoGrid's likely minor userbase — finalize the real text before launch.
        </AlertDescription>
      </Alert>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
          {s.paragraphs?.map((p, i) => (
            <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">{p}</p>
          ))}
          {s.items && (
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="mt-10 border-t pt-6 text-xs text-muted-foreground">
        Questions about this policy? Contact hello@geogrid.example — we respond within one business day.
      </p>
    </div>
  );
}