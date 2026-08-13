import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Rubric } from "@/lib/types";

interface RubricScorerProps {
  rubric: Rubric;
  scores: Record<string, number>;
  onScoreChange?: (criterionId: string, score: number) => void;
  readOnly?: boolean;
  maxScore?: number;
}

export function RubricScorer({ rubric, scores, onScoreChange, readOnly = false, maxScore }: RubricScorerProps) {
  const total = useMemo(() => {
    const weighted = rubric.criteria.reduce((sum, c) => {
      const score = scores[c.id] ?? 0;
      return sum + score * c.weight;
    }, 0);
    const raw = rubric.criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
    return { weighted: Math.round(weighted * 10) / 10, raw, max: rubric.criteria.reduce((s, c) => s + c.maxPoints, 0) };
  }, [rubric, scores]);

  const cap = maxScore ?? Math.round(total.max * Math.max(...rubric.criteria.map((c) => c.weight)) * 10) / 10;

  return (
    <div className="space-y-3">
      {rubric.criteria.map((c) => {
        const value = scores[c.id] ?? 0;
        const pct = Math.round((value / c.maxPoints) * 100);
        return (
          <div key={c.id} className="rounded-md border bg-card p-3">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor={`rubric-${c.id}`} className="text-sm font-medium">
                {c.label}
              </label>
              <span className="mono-data text-xs text-muted-foreground">
                {readOnly ? value : `${value} / ${c.maxPoints}`} · {Math.round(c.weight * 100)}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                id={`rubric-${c.id}`}
                type="range"
                min={0}
                max={c.maxPoints}
                step={1}
                value={value}
                disabled={readOnly}
                aria-label={`${c.label} score`}
                onChange={(e) => onScoreChange?.(c.id, Number(e.target.value))}
                className={cn("h-1.5 w-full accent-primary", readOnly && "pointer-events-none")}
              />
              {!readOnly && (
                <input
                  type="number"
                  min={0}
                  max={c.maxPoints}
                  value={value}
                  aria-label={`${c.label} score value`}
                  onChange={(e) => onScoreChange?.(c.id, Math.min(c.maxPoints, Math.max(0, Number(e.target.value))))}
                  className="mono-data h-8 w-14 rounded-md border border-input bg-background px-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-danger")} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
        <span className="text-sm font-medium">Weighted score</span>
        <span className="mono-data text-lg font-semibold">
          {total.weighted}
          <span className="text-sm font-normal text-muted-foreground"> / {cap}</span>
        </span>
      </div>
    </div>
  );
}