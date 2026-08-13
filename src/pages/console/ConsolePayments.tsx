import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, RotateCcw, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { createCoupon, issueRefund, listCoupons, listTransactions } from "@/features/console/api";
import { exportCsv } from "@/lib/csv";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Coupon, Transaction } from "@/lib/types";

const REASON_CODES = [
  "customer_request",
  "service_issue",
  "duplicate_charge",
  "fraud_alert",
  "technical_error",
];

export default function ConsolePayments() {
  const { requireReauth, writeAudit } = useAdminAuth();
  const [tx, setTx] = useState<Transaction[] | null>(null);
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0]!);
  const [refundNote, setRefundNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newValue, setNewValue] = useState("10");

  const reload = () => {
    Promise.all([listTransactions(), listCoupons()])
      .then(([t, c]) => {
        setTx(t);
        setCoupons(c);
      })
      .catch(() => setError("Couldn't load billing data."));
  };

  useEffect(reload, []);

  const exportTx = () => {
    if (!tx) return;
    exportCsv(
      tx.map((t) => ({ id: t.id, student: t.studentName, amount: t.amount / 100, status: t.status, kind: t.kind, date: t.date, method: t.method })),
      "transactions.csv",
    );
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    await requireReauth();
    setBusy(true);
    try {
      await issueRefund(refundTarget.id, reasonCode, refundNote || undefined);
      writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "payment.refunded", targetType: "transaction", targetId: refundTarget.id, ip: "192.168.1.10", userAgent: "Console", metadata: { reasonCode, note: refundNote } });
      toast.success(`Refund of ${formatMoney(refundTarget.amount)} issued.`);
      setRefundTarget(null);
      setRefundNote("");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refund failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCoupon = async () => {
    if (!newCode.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    await createCoupon({
      code: newCode.trim().toUpperCase(),
      discountType: newType,
      discountValue: Number(newValue) || 0,
      expiresAt: undefined,
      maxRedemptions: undefined,
    });
    setCouponOpen(false);
    setNewCode("");
    toast.success("Coupon created.");
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Transactions, refunds with mandatory reason codes, and discount coupons."
        actions={
          <>
            <Button variant="outline" onClick={exportTx} disabled={!tx?.length}>
              <Download className="h-4 w-4" aria-hidden /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => setCouponOpen(true)}>
              <Tag className="h-4 w-4" aria-hidden /> New coupon
            </Button>
          </>
        }
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!tx ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="mono-data">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{t.kind.replace("_", " ")}</TableCell>
                    <TableCell className="text-muted-foreground">{t.method}</TableCell>
                    <TableCell className="mono-data text-right">{formatMoney(t.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={t.status === "succeeded" ? "success" : t.status === "refunded" ? "secondary" : t.status === "pending" ? "warning" : "danger"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status === "succeeded" && (
                        <Button variant="ghost" size="sm" onClick={() => setRefundTarget(t)}>
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {coupons && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="mono-data font-semibold">{c.code}</span>
                    <Badge variant="secondary">{c.discountType === "percent" ? `${c.discountValue}%` : formatMoney(c.discountValue)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.redemptions}/{c.maxRedemptions ?? "∞"} used · {c.expiresAt ? `expires ${formatDate(c.expiresAt)}` : "no expiry"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Issue refund</DialogTitle>
            <DialogDescription>
              {refundTarget ? `${formatMoney(refundTarget.amount)} to ${refundTarget.studentName}.` : ""} Refunds require re-authentication and a reason code.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warning">
            <AlertIcon variant="warning" />
            <AlertTitle>Policy check</AlertTitle>
            <AlertDescription>
              Refunds are irreversible. Confirm the transaction date: {refundTarget ? formatDate(refundTarget.date) : "—"}.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rf-reason">Reason code</Label>
              <Select value={reasonCode} onValueChange={setReasonCode}>
                <SelectTrigger id="rf-reason"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASON_CODES.map((r) => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-note">Internal note (optional)</Label>
              <Input id="rf-note" value={refundNote} onChange={(e) => setRefundNote(e.target.value)} placeholder="e.g. bank said duplicate charge" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busy} onClick={handleRefund}>
              {busy ? "Processing…" : `Refund ${refundTarget ? formatMoney(refundTarget.amount) : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon dialog */}
      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
            <DialogDescription>Coupons apply at checkout and are tracked for redemption analytics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cp-code">Code</Label>
              <Input id="cp-code" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="SUMMER25" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cp-type">Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as "percent" | "fixed")}>
                  <SelectTrigger id="cp-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent off</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-value">Value</Label>
                <Input id="cp-value" inputMode="numeric" value={newValue} onChange={(e) => setNewValue(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponOpen(false)}>Cancel</Button>
            <Button onClick={handleCoupon}>Create coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}