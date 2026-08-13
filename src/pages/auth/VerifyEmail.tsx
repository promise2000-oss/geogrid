import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";
import { useSeo } from "@/lib/seo";

export default function VerifyEmail() {
  useSeo("Verify your email");
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    timer.current = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [resendIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(email, code);
      navigate("/login?verified=1", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResendIn(60);
    await resendVerification();
  };

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <MailCheck className="h-5 w-5 text-accent-foreground" aria-hidden />
      </span>
      <h1 className="display-tight mt-4 font-display text-2xl font-semibold">Check your inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="mono-data font-medium text-foreground">{email || "your email"}</span>.
        Enter it below to verify your account.
      </p>

      {error && (
        <Alert variant="danger" className="mt-5">
          <AlertIcon variant="danger" />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Verification code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mono-data h-12 w-full rounded-md border border-input bg-background text-center text-xl tracking-[0.4em] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="••••••"
            aria-label="Verification code"
          />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Didn't get it?{" "}
        <button onClick={resend} disabled={resendIn > 0} className="font-medium text-primary hover:underline disabled:opacity-50">
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Demo build: the code is <span className="mono-data">123456</span>.
      </p>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        Already verified? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}