import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  target: string;
  label?: string;
  className?: string;
}

export function Countdown({ target, label = "Time left", className }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setRemaining(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (remaining <= 0) {
    return (
      <span className={cn("mono-data text-sm font-medium text-danger", className)}>Deadline passed</span>
    );
  }

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const urgent = remaining < 86400000;

  return (
    <span className={cn("mono-data text-sm", urgent ? "text-warning" : "text-muted-foreground", className)}>
      {label && <span className="mr-1.5 not-mono text-xs">{label}</span>}
      {days > 0 ? `${days}d ` : ""}
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}