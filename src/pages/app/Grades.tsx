import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareText, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { RichText } from "@/components/shared/rich-text";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";
import { listMyGrades, getSubmissionById, assignmentById, subjectName } from "@/features/assignments/api";
import { formatDate } from "@/lib/utils";
import type { Grade } from "@/lib/types";

interface GradeRow extends Grade {
  assignmentTitle: string;
  subject: string;
  pct: number;
}

export default function Grades() {
  const { user } = useAuth();
  const [rows, setRows] = useState<GradeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const grades = await listMyGrades(user.id);
        const enriched: GradeRow[] = [];
        for (const g of grades.filter((x) => x.status === "released")) {
          const sub = await getSubmissionById(g.submissionId);
          const a = sub ? assignmentById(sub.assignmentId) : undefined;
          enriched.push({
            ...g,
            assignmentTitle: a?.title ?? "Assignment",
            subject: a ? subjectName(a.subjectId) : "—",
            pct: Math.round((g.score / g.maxScore) * 100),
          });
        }
        setRows(enriched.sort((a, b) => b.gradedAt.localeCompare(a.gradedAt)));
      } catch {
        setError("Couldn't load your grades.");
      }
    })();
  }, [user]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const overall = rows.reduce((s, g) => s + g.pct, 0) / rows.length;
    const bySubject = new Map<string, { total: number; count: number }>();
    rows.forEach((g) => {
      const cur = bySubject.get(g.subject) ?? { total: 0, count: 0 };
      cur.total += g.pct;
      cur.count++;
      bySubject.set(g.subject, cur);
    });
    return { overall: Math.round(overall * 10) / 10, bySubject };
  }, [rows]);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      <PageHeader
        title="Grades"
        description="Your full academic record — scores, trends, and every piece of tutor feedback in one place."
      />

      {!rows ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No grades yet"
          description="Grades appear here the moment your tutor releases them. Head to Assignments to get started."
          action={
            <Button asChild>
              <Link to="/app/assignments"><ArrowRight className="h-4 w-4" aria-hidden /> Browse assignments</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Overall average</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mono-data font-display text-5xl font-semibold text-primary">{stats?.overall}%</p>
              <p className="mt-2 text-sm text-muted-foreground">across {rows.length} graded assignment{rows.length === 1 ? "" : "s"}</p>
              <div className="mt-6 space-y-3">
                {[...(stats?.bySubject.entries() ?? [])].map(([subject, s]) => (
                  <div key={subject}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{subject}</span>
                      <span className="mono-data text-muted-foreground">{Math.round((s.total / s.count) * 10) / 10}% · {s.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((s.total / s.count) * 10) / 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /> Trend over time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" role="img" aria-label="Grade trend chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows.map((g) => ({ name: formatDate(g.gradedAt, { month: "short", day: "numeric" }), pct: g.pct }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(value) => [`${value}%`, "Score"]}
                    />
                    <Line type="monotone" dataKey="pct" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>All grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Graded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.assignmentTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{g.subject}</TableCell>
                      <TableCell className="mono-data">{g.score}/{g.maxScore}</TableCell>
                      <TableCell>
                        <Badge variant={g.pct >= 70 ? "success" : g.pct >= 50 ? "warning" : "danger"}>{g.pct}%</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(g.gradedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-muted-foreground" /> Feedback repository</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {rows.map((g) => (
                  <AccordionItem key={g.id} value={g.id}>
                    <AccordionTrigger className="text-sm">
                      <span className="flex items-center gap-2">
                        {g.assignmentTitle}
                        <Badge variant="secondary" className="mono-data">{g.score}/{g.maxScore}</Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <RichText html={g.feedbackPublic} className="text-sm leading-relaxed" />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}