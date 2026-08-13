import { useEffect, useState } from "react";
import { CalendarClock, FilePlus2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { listAllAssignments } from "@/features/console/api";
import { subjectName } from "@/features/assignments/api";
import { exportCsv } from "@/lib/csv";
import { formatDate } from "@/lib/utils";
import type { Assignment } from "@/lib/types";

export default function ConsoleAssignments() {
  const [rows, setRows] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    listAllAssignments().then(setRows).catch(() => setError("Couldn't load assignments."));
  };

  useEffect(reload, []);

  const exportList = () => {
    if (!rows) return;
    exportCsv(
      rows.map((a) => ({
        id: a.id,
        title: a.title,
        subject: subjectName(a.subjectId),
        status: a.status,
        due: a.dueAt,
      })),
      "assignments.csv",
    );
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Every assignment across subjects — status, deadlines, and export."
        actions={
          <>
            <Button variant="outline" onClick={exportList} disabled={!rows?.length}>
              Export CSV
            </Button>
            <Button disabled title="Authoring lives in the Supabase editor in the full build">
              <FilePlus2 className="h-4 w-4" aria-hidden /> Create
            </Button>
          </>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows ? (
        <Skeleton className="h-72 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No assignments" description="Assignments created in the Supabase editor appear here." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{rows.length} assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Late policy</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{subjectName(a.subjectId)}</TableCell>
                    <TableCell className="mono-data">{formatDate(a.dueAt)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.allowLate ? `${a.latePenaltyPct}%/day after due` : "No late submissions"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={a.status === "published" ? "success" : a.status === "scheduled" ? "warning" : a.status === "draft" ? "secondary" : "muted"}>
                        {a.status}
                      </Badge>
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