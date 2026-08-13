import { useEffect, useState } from "react";
import { BarChart3, Download, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { getAnalytics, listStudents } from "@/features/console/api";
import { exportCsv } from "@/lib/csv";
import type { AnalyticsSeriesPoint, ContentStats } from "@/lib/types";

export default function ConsoleReports() {
  const [series, setSeries] = useState<AnalyticsSeriesPoint[] | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [students, setStudents] = useState<{ name: string; avgGrade: number; submissionCount: number; overdueCount: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAnalytics(), listStudents()])
      .then(([a, s]) => {
        setSeries(a.series);
        setStats(a.stats);
        setStudents(s);
      })
      .catch(() => setError("Couldn't build reports."));
  }, []);

  const exportGrades = () => {
    if (!students) return;
    exportCsv(
      students.map((s) => ({ student: s.name, avg_grade: s.avgGrade, submissions: s.submissionCount, overdue: s.overdueCount })),
      "student-grades.csv",
    );
  };

  const exportSignups = () => {
    if (!series) return;
    exportCsv(
      series.map((p) => ({ month: p.month, signups: p.signups, conversions_pct: p.conversionPct })),
      "signups.csv",
    );
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Content performance, cohort health, and raw exports for your own analysis."
        actions={
          <>
            <Button variant="outline" onClick={exportSignups} disabled={!series}>
              <Download className="h-4 w-4" aria-hidden /> Signups CSV
            </Button>
            <Button variant="outline" onClick={exportGrades} disabled={!students}>
              <Download className="h-4 w-4" aria-hidden /> Grades CSV
            </Button>
          </>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : !stats || !series ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
          <Skeleton className="h-80 lg:col-span-4" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Completion rate" value={`${stats.completionRatePct}%`} icon={BarChart3} hint={`${stats.submissionsTotal} submissions total`} tone="primary" />
            <StatCard label="Avg turnaround" value={`${stats.avgTurnaroundHours}h`} icon={GraduationCap} hint="submission → grade" tone="default" />
            <StatCard label="Published assignments" value={String(stats.publishedAssignments)} icon={BarChart3} hint={`${stats.overdueAssignments} overdue now`} tone="warning" />
            <StatCard label="Average grade" value={`${stats.avgGrade}%`} icon={GraduationCap} hint="across released grades" tone="success" />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Signups by month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="signups" radius={[4, 4, 0, 0]}>
                      {series.map((p) => (
                        <Cell key={p.month} fill={p.conversionPct >= 15 ? "var(--success)" : "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Green bars: months where signup→paid conversion was ≥15%.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cohort health</CardTitle>
            </CardHeader>
            <CardContent>
              {!students ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {students.slice(0, 12).map((s) => (
                    <li key={s.name} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{s.name}</span>
                        <span className="mono-data text-sm">{s.avgGrade}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.avgGrade}%` }} />
                      </div>
                      <p className="mono-data mt-2 text-xs text-muted-foreground">
                        {s.submissionCount} submissions · {s.overdueCount} overdue
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}