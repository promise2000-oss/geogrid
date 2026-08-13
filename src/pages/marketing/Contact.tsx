import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSeo } from "@/lib/seo";
import { faqs } from "@/lib/mock/db";
import { WHATSAPP_SUPPORT } from "@/lib/config";

export default function Contact() {
  useSeo("Contact", "Get in touch with the GeoGrid team — support email, WhatsApp, and the contact form.");
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot) return; // bots fill the honeypot; humans never see it
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Message sent — we reply within one business day.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
        <h1 className="display-tight mt-3 font-display text-4xl font-semibold">Talk to a human</h1>
        <p className="mt-4 text-muted-foreground">
          Support replies within one business day. For urgent billing issues, WhatsApp is faster.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4" noValidate={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" name="name" required autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" name="email" type="email" required autoComplete="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" name="subject" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" name="message" required rows={5} />
              </div>
              {/* Honeypot — invisible to humans, irresistible to bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <Button type="submit" size="lg" disabled={submitting}>
                <Send className="h-4 w-4" aria-hidden />
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-base font-semibold">WhatsApp support</h2>
              <p className="mt-1 text-sm text-muted-foreground">The fastest route for urgent billing or account issues.</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden /> Open WhatsApp chat
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-base font-semibold">Email</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                hello@geogrid.example
                <br />
                Response within one business day.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="display-tight text-center font-display text-2xl font-semibold">Before you write</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.filter((f) => f.section === "technical").map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent>{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}