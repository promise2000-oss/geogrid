import { useEffect, useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { listAuditLog } from "@/features/console/api";
import { exportCsv } from "@/lib/csv";
import { formatRelative } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types";

const ACTION_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "secondary"> = {
  "auth.login_success": "success",
  "auth.login_failed": "danger",
  "auth.mfa_failed": "danger",
  "student.suspended": "warning",
  "student.reinstated": "success",
  "student.deleted": "danger",
  "student.impersonated": "warning",
  "payment.refunded": "warning",
  "submission.graded": "success",
  "submission.returned": "secondary",
};

export default function ConsoleAuditLog() {
  const [rows, setRows] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    listAuditLog().then(setRows).catch(() => setError("Couldn't load the audit log."));
  };

  useEffect(reload, []);

  const exportLog = () => {
    if (!rows) return;
    exportCsv(
      rows.map((r) => ({
        when: r.createdAt,
        actor: `${r.actorName} (${r.actorType})`,
        action: r.action,
        target: r.targetId ?? "",
        ip: r.ip,
      })),
      "audit-log.csv",
    );
  };

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Immutable trail of every sensitive action — append-only in production (Edge Function + DB trigger)."
        actions={
          <Button variant="outline" onClick={exportLog} disabled={!rows?.length}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows ? (
        <Skeleton className="h-80 w-full" />
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ShieldCheck className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground">Sensitive actions will appear here as they happen.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{rows.length} entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP / Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="mono-data whitespace-nowrap text-xs">{formatRelative(r.createdAt)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.actorName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.actorType} · {r.actorId}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[r.action] ?? "secondary"} className="mono-data">
                        {r.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="mono-data text-xs text-muted-foreground">
                      {r.targetId ? `${r.targetType ?? ""} ${r.targetId}` : "—"}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground" title={r.userAgent}>
                      {r.ip}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}