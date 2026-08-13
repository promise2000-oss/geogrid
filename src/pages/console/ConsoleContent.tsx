import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, Megaphone, MessageSquareQuote, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/shared/error-state";
import { RichText } from "@/components/shared/rich-text";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import {
  deleteAnnouncement, deleteFaq, listAnnouncements, listEmailTemplates, listFaqs,
  listTestimonials, setTestimonialApproved, upsertAnnouncement, upsertFaq,
} from "@/features/console/api";
import { formatDate } from "@/lib/utils";
import type { Announcement, EmailTemplate, Faq, Testimonial } from "@/lib/types";

export default function ConsoleContent() {
  const { writeAudit } = useAdminAuth();
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [annOpen, setAnnOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annAudience, setAnnAudience] = useState<Announcement["audience"]>("all");

  const [faqOpen, setFaqOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqSection, setFaqSection] = useState<Faq["section"]>("general");

  const reload = () => {
    Promise.all([listAnnouncements(), listTestimonials(), listFaqs(), listEmailTemplates()])
      .then(([a, t, f, e]) => {
        setAnnouncements(a);
        setTestimonials(t);
        setFaqs(f);
        setTemplates(e);
      })
      .catch(() => setError("Couldn't load content."));
  };

  useEffect(reload, []);

  const saveAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    await upsertAnnouncement({ title: annTitle.trim(), body: annBody.trim(), audience: annAudience });
    writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "announcement.published", targetType: "announcement", targetId: "new", ip: "192.168.1.10", userAgent: "Console", metadata: { audience: annAudience } });
    setAnnOpen(false);
    setAnnTitle("");
    setAnnBody("");
    toast.success("Announcement published.");
    reload();
  };

  const saveFaq = async () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error("Question and answer are required.");
      return;
    }
    await upsertFaq({ question: faqQuestion.trim(), answer: faqAnswer.trim(), section: faqSection });
    setFaqOpen(false);
    setFaqQuestion("");
    setFaqAnswer("");
    toast.success("FAQ entry saved.");
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Content"
        description="Announcements, testimonials, FAQ, and transactional email templates."
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <Tabs defaultValue="announcements">
        <TabsList className="flex-wrap">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="templates">Email templates</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-muted-foreground" /> Announcements</CardTitle>
              <Button size="sm" onClick={() => setAnnOpen(true)}><Plus className="h-3.5 w-3.5" aria-hidden /> New</Button>
            </CardHeader>
            <CardContent>
              {!announcements ? (
                <Skeleton className="h-40 w-full" />
              ) : announcements.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{a.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {a.createdBy} · {a.publishedAt ? formatDate(a.publishedAt) : "draft"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="secondary" className="capitalize">{a.audience}</Badge>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete announcement"
                            onClick={async () => {
                              await deleteAnnouncement(a.id);
                              toast.success("Announcement deleted.");
                              reload();
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <RichText html={a.body} className="mt-2 text-sm text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-muted-foreground" /> Testimonials</CardTitle>
              <Badge variant="secondary">{testimonials?.filter((t) => !t.approved).length ?? 0} pending approval</Badge>
            </CardHeader>
            <CardContent>
              {!testimonials ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ul className="space-y-3">
                  {testimonials.map((t) => (
                    <li key={t.id} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm italic">“{t.quote}”</p>
                          <p className="mt-1 text-xs text-muted-foreground">— {t.author}, {t.role}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={t.approved ? "success" : "warning"}>{t.approved ? "Approved" : "Pending"}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await setTestimonialApproved(t.id, !t.approved);
                              writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "testimonial.toggled", targetType: "testimonial", targetId: t.id, ip: "192.168.1.10", userAgent: "Console" });
                              reload();
                            }}
                          >
                            {t.approved ? <X className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            {t.approved ? "Unapprove" : "Approve"}
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> FAQ</CardTitle>
              <Button size="sm" onClick={() => setFaqOpen(true)}><Plus className="h-3.5 w-3.5" aria-hidden /> Add entry</Button>
            </CardHeader>
            <CardContent>
              {!faqs ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ul className="space-y-2">
                  {faqs.map((f) => (
                    <li key={f.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">{f.question}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{f.answer}</p>
                        <Badge variant="outline" className="mt-2 capitalize">{f.section}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete FAQ entry"
                        onClick={async () => {
                          await deleteFaq(f.id);
                          toast.success("FAQ entry deleted.");
                          reload();
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Transactional email templates</CardTitle>
            </CardHeader>
            <CardContent>
              {!templates ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ul className="space-y-3">
                  {templates.map((t) => (
                    <li key={t.key} className="rounded-md border p-4">
                      <p className="mono-data text-xs text-muted-foreground">{t.key}</p>
                      <p className="mt-1 font-medium">{t.subject}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.variables.map((v) => (
                          <Badge key={v} variant="outline" className="mono-data">{"{{"}{v}{"}}"}</Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New announcement */}
      <Dialog open={annOpen} onOpenChange={setAnnOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>Reaches the notification feed (and WhatsApp, per each student's preferences).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="an-title">Title</Label>
              <Input id="an-title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="an-body">Body</Label>
              <Textarea id="an-body" rows={4} value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="an-audience">Audience</Label>
              <Select value={annAudience} onValueChange={(v) => setAnnAudience(v as Announcement["audience"])}>
                <SelectTrigger id="an-audience"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["all", "free", "premium", "institution", "cohort"] as const).map((a) => (
                    <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnOpen(false)}>Cancel</Button>
            <Button onClick={saveAnnouncement}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New FAQ */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add FAQ entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fq-question">Question</Label>
              <Input id="fq-question" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fq-answer">Answer</Label>
              <Textarea id="fq-answer" rows={3} value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fq-section">Section</Label>
              <Select value={faqSection} onValueChange={(v) => setFaqSection(v as Faq["section"])}>
                <SelectTrigger id="fq-section"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqOpen(false)}>Cancel</Button>
            <Button onClick={saveFaq}>Save entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}