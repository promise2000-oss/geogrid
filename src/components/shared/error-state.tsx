import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message = "Something went wrong loading this view.", onRetry, compact }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger-muted/40 px-6 text-center ${
        compact ? "py-6" : "py-12"
      }`}
    >
      <TriangleAlert className="h-5 w-5 text-danger" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}