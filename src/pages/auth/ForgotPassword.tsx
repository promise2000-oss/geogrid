import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";
import { useSeo } from "@/lib/seo";

export default function ForgotPassword() {
  useSeo("Reset password");
  const { sendResetLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendResetLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="display-tight font-display text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your account email and we'll send you a single-use reset code.
      </p>

      {sent && (
        <Alert variant="success" className="mt-5">
          <AlertIcon variant="success" />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            If an account exists for that email, a reset code is on its way. The link expires in 1 hour.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mt-5">
          <AlertIcon variant="danger" />
          <AlertTitle>Couldn't send reset link</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!sent && (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="fp-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      {sent && (
        <Button asChild size="lg" className="mt-6 w-full">
          <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>I have my code — reset now</Link>
        </Button>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it? <Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}