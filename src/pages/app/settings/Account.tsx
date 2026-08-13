import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Download, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { getMyPlan, listInvoices } from "@/features/billing/api";
import { downloadBlob, formatDate, formatMoney } from "@/lib/utils";
import type { Plan, Subscription } from "@/lib/types";

export default function Account() {
  const { user, signOut } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!user) return;
    getMyPlan(user.id).then(({ plan: p, subscription: s }) => {
      setPlan(p);
      setSubscription(s);
    });
  }, [user]);

  if (!user) return null;

  const exportData = async () => {
    if (!user) return;
    const invoices = await listInvoices(user.id);
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: user,
      plan: plan?.name,
      invoices: invoices.map((i) => ({ id: i.id, amount: i.amount, status: i.status, issuedAt: i.issuedAt })),
    };
    downloadBlob(JSON.stringify(payload, null, 2), "geogrid-my-data.json", "application/json");
    toast.success("Your data export is ready.");
  };

  const handleDelete = () => {
    if (confirmText !== user.email) {
      toast.error("Type your email exactly as shown to confirm deletion.");
      return;
    }
    toast.info("Account deletion scheduled. A 14-day cancellation window has started (real build: Edge Function + Stripe).");
    setDeleteOpen(false);
    setTimeout(() => signOut(), 800);
  };

  return (
    <div>
      <PageHeader
        title="Account"
        description="Subscription, connected accounts, your data — and the danger zone."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Managed via the Payments page.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/payments">
                Manage billing <ExternalLink className="ml-1 h-3 w-3" aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!plan ? (
              <Skeleton className="h-10 w-56" />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-xl font-semibold">{plan.name}</span>
                {subscription && (
                  <Badge variant={subscription.status === "active" ? "success" : "warning"}>
                    {subscription.status.replace("_", " ")}
                  </Badge>
                )}
                {subscription && (
                  <span className="mono-data text-sm text-muted-foreground">
                    {subscription.billingCycle} · renews {formatDate(subscription.currentPeriodEnd)}
                  </span>
                )}
                {plan.priceMonthly > 0 && (
                  <span className="mono-data text-sm text-muted-foreground">
                    {formatMoney(subscription?.billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly)} / {subscription?.billingCycle ?? "monthly"}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>Sign-in options linked to your GeoGrid account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">G</span>
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast("Disconnecting Google is disabled for demo accounts.")}>
                  Disconnect
                </Button>
              </li>
              <li className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">W</span>
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Not linked — add it to mirror notifications to your phone.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("WhatsApp linking uses the Twilio Embedded Signup widget in the real build.")}>
                  Link
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your data</CardTitle>
            <CardDescription>You can export everything GeoGrid holds about you, at any time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4" aria-hidden /> Export my data (JSON)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-danger/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger"><AlertTriangle className="h-4 w-4" aria-hidden /> Danger zone</CardTitle>
            <CardDescription>Deleting your account removes your profile, submissions, and grades. Invoices remain for accounting compliance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" aria-hidden /> Delete my account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This is permanent. Your submissions and grades will be removed and your subscription canceled with no refund.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="danger">
            <AlertIcon variant="danger" />
            <AlertTitle>Consider exporting first</AlertTitle>
            <AlertDescription>
              Use “Export my data” above to keep a copy of your records before deleting.
            </AlertDescription>
          </Alert>
          <div className="space-y-1.5">
            <Label htmlFor="del-confirm">Type <span className="font-mono">{user.email}</span> to confirm</Label>
            <Input id="del-confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={user.email} autoComplete="off" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== user.email}>
              Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}