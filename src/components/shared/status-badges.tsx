import { CheckCircle2, FileQuestion, Hourglass, RotateCcw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/lib/types";

const CONFIG: Record<SubmissionStatus, { label: string; variant: "muted" | "secondary" | "warning" | "success" | "danger"; icon: React.ReactNode }> = {
  draft: { label: "In progress", variant: "secondary", icon: <FileQuestion /> },
  submitted: { label: "Submitted", variant: "secondary", icon: <Send /> },
  under_review: { label: "Under review", variant: "warning", icon: <Hourglass /> },
  graded: { label: "Graded", variant: "success", icon: <CheckCircle2 /> },
  returned: { label: "Returned for correction", variant: "danger", icon: <RotateCcw /> },
};

export function SubmissionStatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  const c = CONFIG[status];
  return (
    <Badge variant={c.variant} className={className}>
      {c.icon}
      {c.label}
    </Badge>
  );
}