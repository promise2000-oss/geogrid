import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

/** Offline banner for the authenticated app (PWA). Drafts queue locally and sync on reconnect. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const { user } = useAuth();

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline || !user) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-warning/40 bg-warning-muted px-4 py-1.5 text-xs font-medium text-warning-foreground">
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      You're offline. Drafts are saved locally and will sync when you're back online.
    </div>
  );
}