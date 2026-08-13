import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";
import { useSeo } from "@/lib/seo";

export default function ResetPassword() {
  useSeo("Reset password");
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, password);
      toast.success("Password updated — sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="display-tight font-display text-2xl font-semibold">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the reset code from your email and a new password. The code is single-use and expires in 1 hour.
      </p>

      {error && (
        <Alert variant="danger" className="mt-5">
          <AlertIcon variant="danger" />
          <AlertTitle>Reset failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rp-code">Reset code</Label>
          <Input
            id="rp-code"
            inputMode="numeric"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mono-data tracking-[0.3em]"
            placeholder="••••••"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rp-password">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="rp-password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="8+ characters" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rp-confirm">Confirm new password</Label>
          <Input id="rp-confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo build: the reset code is <span className="mono-data">123456</span>.
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}