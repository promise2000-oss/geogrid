import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Download, Loader2, Lock, Plus, Receipt, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import {
  addPaymentMethod, getMyPlan, listInvoices, listPaymentMethods, payInvoice, removePaymentMethod,
  setDefaultPaymentMethod, updateBillingCycle,
} from "@/features/billing/api";
import { downloadBlob, formatDate, formatMoney } from "@/lib/utils";
import type { Invoice, PaymentMethod, Plan, Subscription } from "@/lib/types";

export default function Payments() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | undefined>();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [newBrand, setNewBrand] = useState("Visa");
  const [newLast4, setNewLast4] = useState("");
  const [changingCycle, setChangingCycle] = useState(false);

  const reload = async () => {
    if (!user) return;
    const [p, inv, pm] = await Promise.all([
      getMyPlan(user.id),
      listInvoices(user.id),
      listPaymentMethods(user.id),
    ]);
    setPlan(p.plan);
    setSubscription(p.subscription);
    setInvoices(inv);
    setMethods(pm);
  };

  useEffect(() => {
    if (!user) return;
    reload().catch(() => setError("Couldn't load your billing information."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const outstanding = invoices?.find((i) => i.status === "past_due") ?? invoices?.find((i) => i.status === "open");

  const handlePay = async (invoice: Invoice) => {
    setPaying(true);
    try {
      await payInvoice(invoice.id);
      await reload();
      toast.success("Payment successful — receipt available below.");
      setCheckoutOpen(false);
    } catch {
      toast.error("Payment failed. Check your card details and try again.");
    } finally {
      setPaying(false);
    }
  };

  const downloadReceipt = (invoice: Invoice) => {
    downloadBlob(
      `GeoGrid receipt\nInvoice: ${invoice.id}\nAmount: ${formatMoney(invoice.amount)}\nStatus: ${invoice.status}\nIssued: ${formatDate(invoice.issuedAt)}`,
      `geogrid-receipt-${invoice.id}.txt`,
      "text/plain",
    );
  };

  const addMethod = async () => {
    if (!user || newLast4.length !== 4) {
      toast.error("Enter the last 4 digits of the card.");
      return;
    }
    await addPaymentMethod(user.id, newBrand, newLast4);
    setAddMethodOpen(false);
    setNewLast4("");
    await reload();
    toast.success("Payment method added.");
  };

  const cycleLabel = subscription?.billingCycle === "annual" ? "annual" : "monthly";

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Your plan, invoices, and payment methods — everything billing, in one place."
      />

      {error && (
        <Alert variant="danger" className="mb-6">
          <AlertIcon variant="danger" />
          <AlertTitle>Billing failed to load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {outstanding && (
        <Alert variant="warning" className="mb-6">
          <AlertIcon variant="warning" />
          <AlertTitle>Outstanding balance — {formatMoney(outstanding.amount)}</AlertTitle>
          <AlertDescription>
            Invoice {outstanding.id} ({formatDate(outstanding.issuedAt)}) is unpaid. Settle it to keep Premium features active.
            <Button size="sm" className="ml-3" onClick={() => setCheckoutOpen(true)}>Pay now</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
          </CardHeader>
          <CardContent>
            {!plan ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <p className="font-display text-3xl font-semibold">{plan.name}</p>
                <p className="mono-data mt-1 text-lg text-muted-foreground">
                  {plan.priceMonthly === 0 ? "$0" : formatMoney(subscription?.billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly)}
                  {plan.priceMonthly > 0 && ` / ${cycleLabel}`}
                </p>
                {subscription && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {subscription.status === "active" ? "Active" : subscription.status.replace("_", " ")} · renews {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">Billing cycle</span>
                    <Select
                      value={subscription?.billingCycle ?? "monthly"}
                      disabled={!subscription || changingCycle}
                      onValueChange={async (v: "monthly" | "annual") => {
                        if (!user) return;
                        setChangingCycle(true);
                        await updateBillingCycle(user.id, v);
                        await reload();
                        setChangingCycle(false);
                        toast.success(v === "annual" ? "Switched to annual — two months free." : "Switched to monthly billing.");
                      }}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual (−16%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast("This opens Stripe Customer Portal in the real build.")}>
                    Manage subscription
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4 text-muted-foreground" /> Invoices</CardTitle>
            <Badge variant="secondary" className="mono-data">{invoices?.length ?? "…"} invoices</Badge>
          </CardHeader>
          <CardContent>
            {!invoices ? (
              <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : invoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="mono-data font-medium">{inv.id}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(inv.issuedAt)}</TableCell>
                      <TableCell className="mono-data">{formatMoney(inv.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "paid" ? "success" : inv.status === "past_due" ? "danger" : "warning"}>
                          {inv.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => downloadReceipt(inv)} aria-label={`Download receipt for ${inv.id}`}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {(inv.status === "past_due" || inv.status === "open") && (
                            <Button variant="outline" size="sm" onClick={() => setCheckoutOpen(true)}>Pay now</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> Payment methods</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddMethodOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> Add method
            </Button>
          </CardHeader>
          <CardContent>
            {!methods ? (
              <Skeleton className="h-16 w-full" />
            ) : methods.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No payment methods saved. Add one for one-click renewals.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {methods.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <CreditCard className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {m.brand} •• {m.last4}
                        {m.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                      </p>
                      <p className="mono-data text-xs text-muted-foreground">exp {m.expires}</p>
                    </div>
                    <div className="flex gap-1">
                      {!m.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Make ${m.brand} default`}
                          onClick={async () => {
                            if (!user) return;
                            await setDefaultPaymentMethod(m.id, user.id);
                            await reload();
                          }}
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${m.brand} card`}
                        onClick={async () => {
                          await removePaymentMethod(m.id);
                          await reload();
                          toast.success("Payment method removed.");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mock Stripe Payment Element */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay outstanding balance</DialogTitle>
            <DialogDescription>
              {outstanding ? `${formatMoney(outstanding.amount)} — invoice ${outstanding.id}.` : "No outstanding balance."}
              {" "}Secure checkout powered by Stripe.
            </DialogDescription>
          </DialogHeader>
          {outstanding && (
            <div className="space-y-3 rounded-md border p-4">
              <div className="space-y-1.5">
                <Label htmlFor="pm-card">Card number</Label>
                <Input id="pm-card" inputMode="numeric" defaultValue="4242 4242 4242 4242" aria-describedby="pm-demo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pm-exp">Expiry</Label>
                  <Input id="pm-exp" defaultValue="12/29" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pm-cvc">CVC</Label>
                  <Input id="pm-cvc" inputMode="numeric" defaultValue="123" />
                </div>
              </div>
              <p id="pm-demo" className="text-xs text-muted-foreground">
                Demo checkout — use the pre-filled test card. No real payment is processed.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={() => outstanding && handlePay(outstanding)} disabled={!outstanding || paying}>
              {paying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {paying ? "Processing…" : `Pay ${outstanding ? formatMoney(outstanding.amount) : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add payment method */}
      <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>Card details are tokenized by Stripe — GeoGrid never stores full card numbers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-brand">Card network</Label>
              <Select value={newBrand} onValueChange={setNewBrand}>
                <SelectTrigger id="pm-brand"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Visa", "Mastercard", "Amex"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-last4">Last 4 digits</Label>
              <Input id="pm-last4" inputMode="numeric" maxLength={4} value={newLast4} onChange={(e) => setNewLast4(e.target.value.replace(/\D/g, ""))} placeholder="4242" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMethodOpen(false)}>Cancel</Button>
            <Button onClick={addMethod} disabled={newLast4.length !== 4}>Add card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}