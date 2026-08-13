import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Users, BookOpenCheck, Hourglass, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { getAnalytics, listStudents, listSubmissionQueue, listTransactions, type QueueItem } from "@/features/console/api";
import { exportCsv } from "@/lib/csv";
import { formatMoney } from "@/lib/utils";
import type { AnalyticsSeriesPoint, RosterStudent, Transaction } from "@/lib/types";

export default function ConsoleDashboard() {
  const [analytics, setAnalytics] = useState<{ series: AnalyticsSeriesPoint[]; stats: { mrr: number; arr: number; churnPct: number; activeStudents: number; newStudents: number; signups: number; conversionPct: number } } | null>(null);
  const [students, setStudents] = useState<RosterStudent[] | null>(null);
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [tx, setTx] = useState<Transaction[] | null>(null);

  useEffect(() => {
    Promise.all([getAnalytics(), listStudents(), listSubmissionQueue(undefined), listTransactions()]).then(
      ([a, s, q, t]) => {
        setAnalytics(a as never);
        setStudents(s);
        setQueue(q);
        setTx(t);
      },
    );
  }, []);

  const exportMonthly = () => {
    if (!analytics) return;
    exportCsv(
      analytics.series.map((p) => ({
        month: p.month,
        mrr: p.mrr,
        active_students: p.activeStudents,
        new_students: p.newStudents,
        churn_pct: p.churnPct,
        conversion_pct: p.conversionPct,
      })),
      "monthly-report.csv",
    );
  };

  const pending = queue?.filter((q) => q.submission.status === "under_review").length ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform health at a glance — usage, revenue, and what needs your attention."
        actions={
          <Button variant="outline" onClick={exportMonthly} disabled={!analytics}>
            <Download className="h-4 w-4" aria-hidden /> Export monthly (CSV)
          </Button>
        }
      />

      {!analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
          <Skeleton className="h-80 lg:col-span-4" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active students"
              value={analytics.stats.activeStudents.toLocaleString()}
              icon={Users}
              hint={`+${analytics.stats.newStudents} this month`}
              tone="primary"
            />
            <StatCard
              label="Monthly recurring revenue"
              value={formatMoney(analytics.stats.mrr)}
              icon={DollarSign}
              hint={`ARR ${formatMoney(analytics.stats.arr)}`}
              tone="success"
            />
            <StatCard
              label="Submissions in review"
              value={String(pending)}
              icon={Hourglass}
              hint={pending > 0 ? "needs grading" : "queue is clear"}
              tone={pending > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Churn (12-mo)"
              value={`${analytics.stats.churnPct}%`}
              icon={TrendingUp}
              hint={`${analytics.stats.conversionPct}% signup → paid conversion`}
              tone="default"
            />
          </div>

          <Card className="mt-6">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-muted-foreground" /> Active students & MRR — last 12 months</CardTitle>
              <Badge variant="secondary">Live</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.series}>
                    <defs>
                      <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(value, name) => [formatMoney(Number(value)), name === "mrr" ? "MRR" : name]}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="var(--primary)" strokeWidth={2} fill="url(#mrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Grading queue</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/system-console/submissions">Open queue <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!queue ? (
                  <Skeleton className="h-40 w-full" />
                ) : queue.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Queue is empty — nice work.</p>
                ) : (
                  <ul className="space-y-2">
                    {queue.slice(0, 5).map((q) => (
                      <li key={q.submission.id} className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm">
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{q.studentName}</span>
                          <span className="text-muted-foreground"> · {q.assignmentTitle}</span>
                        </span>
                        <Badge variant={q.daysInQueue >= 3 ? "danger" : q.daysInQueue >= 2 ? "warning" : "secondary"}>
                          {q.daysInQueue}d
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recent payments</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/system-console/payments">All payments <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!tx ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tx.slice(0, 5).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm font-medium">{t.studentName}</TableCell>
                          <TableCell className="mono-data text-right">{formatMoney(t.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={t.status === "succeeded" ? "success" : t.status === "refunded" ? "secondary" : "danger"}>
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {students && (
            <Card className="mt-6">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recently active students</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/system-console/students">All students <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Avg grade</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="mono-data text-right">{s.avgGrade}%</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}