import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Search, UserX, Undo2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { deleteStudent, getStudent, listStudents, reinstateStudent, suspendStudent } from "@/features/console/api";
import { formatDate, initials } from "@/lib/utils";
import type { RosterStudent } from "@/lib/types";

export default function ConsoleStudents() {
  const { writeAudit, setImpersonating, impersonating } = useAdminAuth();
  const [rows, setRows] = useState<RosterStudent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RosterStudent | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<RosterStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RosterStudent | null>(null);

  const reload = () => {
    listStudents().then(setRows).catch(() => setError("Couldn't load the student roster."));
  };

  useEffect(reload, []);

  const filtered = (rows ?? []).filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) || s.email.toLowerCase().includes(query.toLowerCase()),
  );

  const openDetail = async (id: string) => {
    setSelected(await getStudent(id) ?? null);
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    await suspendStudent(suspendTarget.id, suspendReason);
    writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "student.suspended", targetType: "student", targetId: suspendTarget.id, ip: "192.168.1.10", userAgent: "Console", metadata: { reason: suspendReason } });
    setSuspendTarget(null);
    setSuspendReason("");
    toast.success(`${suspendTarget.name} suspended — they can still message support.`);
    reload();
  };

  const handleReinstate = async (s: RosterStudent) => {
    await reinstateStudent(s.id);
    writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "student.reinstated", targetType: "student", targetId: s.id, ip: "192.168.1.10", userAgent: "Console" });
    toast.success(`${s.name} reinstated.`);
    reload();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteStudent(deleteTarget.id);
    writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "student.deleted", targetType: "student", targetId: deleteTarget.id, ip: "192.168.1.10", userAgent: "Console", metadata: { gdpr: true } });
    setDeleteTarget(null);
    toast.success(`${deleteTarget.name} deleted (GDPR erasure simulated).`);
    reload();
  };

  const toggleImpersonation = (s: RosterStudent) => {
    if (impersonating === s.id) {
      setImpersonating(null);
      toast.info("Impersonation stopped.");
    } else {
      setImpersonating(s.id);
      writeAudit({ actorType: "admin", actorId: "a-1", actorName: "Priya Nair", action: "student.impersonated", targetType: "student", targetId: s.id, ip: "192.168.1.10", userAgent: "Console" });
      toast.warning(`You are now viewing as ${s.name}. Every action is audit-logged.`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="Roster management, accounts in arrears, and compliance actions."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              aria-label="Search students"
              className="pl-9"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{filtered.length} student{filtered.length === 1 ? "" : "s"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="text-right">Avg grade</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <button className="flex items-center gap-2 text-left font-medium hover:underline" onClick={() => openDetail(s.id)}>
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>{initials(s.name)}</AvatarFallback>
                          </Avatar>
                          <span>
                            <span className="block">{s.name}</span>
                            <span className="block text-xs font-normal text-muted-foreground">{s.email}</span>
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.enrollment}</TableCell>
                      <TableCell className="mono-data text-right">{s.avgGrade}%</TableCell>
                      <TableCell className="mono-data text-right">{s.balance > 0 ? `$${(s.balance / 100).toFixed(2)}` : "—"}</TableCell>
                      <TableCell className="mono-data text-right">{s.overdueCount}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={impersonating === s.id ? "Stop impersonating" : `Impersonate ${s.name}`}
                            onClick={() => toggleImpersonation(s)}
                          >
                            {impersonating === s.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          {s.status === "active" ? (
                            <Button variant="ghost" size="icon-sm" aria-label={`Suspend ${s.name}`} onClick={() => setSuspendTarget(s)}>
                              <UserX className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon-sm" aria-label={`Reinstate ${s.name}`} onClick={() => handleReinstate(s)}>
                              <Undo2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Student detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 text-base">
                    <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{selected.name}</SheetTitle>
                    <SheetDescription>{selected.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Avg grade</p>
                    <p className="mono-data mt-1 text-lg font-semibold">{selected.avgGrade}%</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="mono-data mt-1 text-lg font-semibold">${(selected.balance / 100).toFixed(2)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Submissions</p>
                    <p className="mono-data mt-1 text-lg font-semibold">{selected.submissionCount}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Overdue</p>
                    <p className="mono-data mt-1 text-lg font-semibold">{selected.overdueCount}</p>
                  </div>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Last active</p>
                  <p className="mt-1">{formatDate(selected.lastActiveAt)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrollment: {selected.enrollment} · Status: {selected.status}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Suspend dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.name}?</DialogTitle>
            <DialogDescription>
              Suspension blocks assignment access immediately. A reason is recorded in the audit log — no reason, no suspension.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="su-reason">Reason</Label>
            <Input
              id="su-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. repeated non-payment after 3 reminders"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!suspendReason.trim()} onClick={handleSuspend}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              GDPR erasure — removes their profile, submissions, and grades permanently. Payments history is retained anonymously.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}