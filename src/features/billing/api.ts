import { invoices, paymentMethods, plans, subscriptions } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import type { Invoice, PaymentMethod, Plan, Subscription } from "@/lib/types";

export async function getMyPlan(userId: string): Promise<{ plan: Plan; subscription?: Subscription }> {
  await latency(80);
  const subscription = subscriptions.find((s) => s.userId === userId && s.status !== "canceled");
  const plan = plans.find((p) => p.id === (subscription?.planId ?? "free"))!;
  return { plan, subscription };
}

export async function listInvoices(userId: string): Promise<Invoice[]> {
  await latency();
  const subIds = subscriptions.filter((s) => s.userId === userId).map((s) => s.id);
  return invoices
    .filter((i) => subIds.includes(i.subscriptionId))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export async function payInvoice(invoiceId: string): Promise<Invoice> {
  await latency(600);
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found.");
  invoice.status = "paid";
  invoice.paidAt = new Date().toISOString();
  return invoice;
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  await latency();
  return paymentMethods.filter((m) => m.userId === userId);
}

export async function addPaymentMethod(userId: string, brand: string, last4: string): Promise<PaymentMethod> {
  await latency(400);
  const method: PaymentMethod = {
    id: uid("pm"),
    userId,
    brand,
    last4,
    isDefault: paymentMethods.filter((m) => m.userId === userId).length === 0,
    expires: "12/29",
  };
  paymentMethods.push(method);
  return method;
}

export async function removePaymentMethod(id: string): Promise<void> {
  await latency(200);
  const idx = paymentMethods.findIndex((m) => m.id === id);
  if (idx >= 0) paymentMethods.splice(idx, 1);
}

export async function setDefaultPaymentMethod(id: string, userId: string): Promise<void> {
  await latency(150);
  paymentMethods.forEach((m) => (m.isDefault = m.userId === userId && m.id === id));
}

export async function updateBillingCycle(userId: string, cycle: "monthly" | "annual"): Promise<Subscription> {
  await latency(500);
  const sub = subscriptions.find((s) => s.userId === userId);
  if (!sub) throw new Error("No subscription.");
  sub.billingCycle = cycle;
  return sub;
}