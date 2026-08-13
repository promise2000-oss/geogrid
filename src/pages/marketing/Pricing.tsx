import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSeo } from "@/lib/seo";
import { faqs, plans } from "@/lib/mock/db";
import { WHATSAPP_SUPPORT } from "@/lib/config";

function formatPrice(cents: number) {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}

export default function Pricing() {
  useSeo("Pricing", "Free, Premium, and Institution plans for WhatsApp-based tutoring. Compare features and pick the plan that fits.");
  const [searchParams] = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const preselected = searchParams.get("plan");

  const billingFaqs = faqs.filter((f) => f.section === "billing");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
        <h1 className="display-tight mt-3 font-display text-4xl font-semibold">Simple plans, no seat math</h1>
        <p className="mt-4 text-muted-foreground">
          Every plan starts free. Upgrade when the structure pays for itself — cancel anytime, keep your records.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border bg-card px-1.5 py-1.5">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-pressed={!annual}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-pressed={annual}
          >
            Annual
            <Badge variant="success" className="text-[10px]">2 months free</Badge>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const selected = preselected === plan.id || (preselected === "institution" && plan.id === "institution");
          const price = plan.id === "institution" ? "Custom" : formatPrice(annual ? plan.priceAnnual : plan.priceMonthly);
          const per = plan.id === "institution" ? "" : annual ? "/yr" : "/mo";
          return (
            <Card key={plan.id} className={`relative flex flex-col ${plan.highlight ? "border-primary shadow-md" : ""} ${selected ? "ring-2 ring-primary" : ""}`}>
              {plan.highlight && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>}
              <CardContent className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="mono-data mt-5 text-4xl font-semibold">
                  {price}
                  <span className="text-sm font-normal text-muted-foreground"> {per}</span>
                </p>
                <Button asChild variant={plan.highlight ? "default" : "outline"} className="mt-5" size="lg">
                  <Link to={plan.id === "institution" ? "/contact" : "/register"}>{plan.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>Questions about billing?</span>
        <Button asChild variant="outline" size="sm">
          <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp us
          </a>
        </Button>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="display-tight text-center font-display text-2xl font-semibold">Billing FAQ</h2>
        <Accordion type="single" collapsible className="mt-8">
          {billingFaqs.map((f) => (
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