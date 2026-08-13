import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { useNow } from "@/lib/use-now";
import { ADMIN_HOME_PATH } from "@/lib/config";

export default function ConsoleAccess() {
  const { admin, loginStep, beginAdminLogin, completeAdminLogin, lockUntil, failedCount } = useAdminAuth();
  const now = useNow(30000);
  const lockMinsLeft = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 60000)) : 0;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to={ADMIN_HOME_PATH} replace />;

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await beginAdminLogin(email, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleTotp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await completeAdminLogin(code);
      toast.success("Signed in to the console.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <svg width={40} height={40} viewBox="0 0 64 64" fill="none" aria-hidden className="mx-auto">
            <rect width="64" height="64" rx="14" fill="#3654F4" />
            <path d="M14 24h36M14 32h36M14 40h36M22 24v16M32 24v16M42 24v16" stroke="#FAFAF9" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">GeoGrid Console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loginStep === "credentials" ? "Restricted — staff access only" : `Verify it's you · ${email}`}
          </p>
        </div>

        {lockUntil && (
          <Alert variant="danger" className="mb-4">
            <AlertIcon variant="danger" />
            <AlertTitle>Account temporarily locked</AlertTitle>
            <AlertDescription>
              Too many failed attempts. Try again in {lockMinsLeft} minute{lockMinsLeft === 1 ? "" : "s"}.
            </AlertDescription>
          </Alert>
        )}

        {loginStep === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-1.5">
              <Label htmlFor="ca-email">Staff email</Label>
              <Input
                id="ca-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@geogrid.test"
                autoComplete="username"
                disabled={!!lockUntil}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-password">Password</Label>
              <Input
                id="ca-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={!!lockUntil}
                required
              />
            </div>
            {failedCount > 0 && failedCount < 5 && (
              <p className="text-xs text-warning">
                {failedCount} of 5 attempts used — the account locks after 5 failures.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy || !!lockUntil}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              Continue
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo: <span className="mono-data">super@geogrid.test</span> / any password
            </p>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-1.5">
              <Label htmlFor="ca-totp">Security code</Label>
              <Input
                id="ca-totp"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
              Verify & sign in
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Two-factor authentication is mandatory for console access.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          All access attempts are recorded in the audit log (SRD §7).
        </p>
      </div>
    </div>
  );
}