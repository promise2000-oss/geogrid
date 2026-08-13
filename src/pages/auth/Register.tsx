import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { useSeo } from "@/lib/seo";

function yearsAgo(n: number) {
  return new Date().getFullYear() - n;
}

export default function Register() {
  useSeo("Create your account");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => {
    if (!dobYear) return null;
    const today = new Date();
    const born = new Date(Number(dobYear), Number(dobMonth || 1) - 1, Number(dobDay || 1));
    let a = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) a--;
    return a;
  }, [dobYear, dobMonth, dobDay]);

  const requiresConsent = age !== null && age < 13;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (requiresConsent && !guardianConsent) {
      setError("A parent or guardian must consent to this account before we can continue.");
      return;
    }
    if (!dobYear || !dobMonth || !dobDay) {
      setError("Please enter your full date of birth.");
      return;
    }
    setLoading(true);
    try {
      const iso = `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`;
      await register({ fullName, email, password, dob: iso });
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h1 className="display-tight font-display text-2xl font-semibold">Create your account</h1>
        {plan && (
          <Badge variant={plan === "premium" ? "success" : "secondary"}>
            {plan === "institution" ? "Institution plan" : `${plan} plan selected`}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Free forever for up to 3 assignments. Verify your email and you're in.
      </p>

      {error && (
        <Alert variant="danger" className="mt-5">
          <AlertIcon variant="danger" />
          <AlertTitle>Can't create account</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="reg-name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" placeholder="Maya Chen" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="reg-password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="8+ characters" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirm password</Label>
            <Input id="reg-confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Date of birth</legend>
          <div className="grid grid-cols-3 gap-2">
            <Select value={dobDay} onValueChange={setDobDay} required>
              <SelectTrigger aria-label="Day"><SelectValue placeholder="Day" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dobMonth} onValueChange={setDobMonth} required>
              <SelectTrigger aria-label="Month"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dobYear} onValueChange={setDobYear} required>
              <SelectTrigger aria-label="Year"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 90 }, (_, i) => yearsAgo(i)).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            We use this for age-appropriate onboarding (COPPA/GDPR). {age !== null && age < 18 && "You're under 18 — that's fine, see below."}
          </p>
        </fieldset>

        {requiresConsent && (
          <Alert variant="warning">
            <AlertIcon variant="warning" />
            <AlertTitle>Parental consent required</AlertTitle>
            <AlertDescription>
              You're under 13, so a parent or guardian must set up this account. Confirm below that they've agreed to
              GeoGrid's Privacy Policy on your behalf — we may also email them to confirm.
            </AlertDescription>
          </Alert>
        )}

        <label className={`flex items-start gap-2 text-sm ${requiresConsent ? "" : "pointer-events-none opacity-40"}`}>
          <input
            type="checkbox"
            checked={guardianConsent}
            onChange={(e) => setGuardianConsent(e.target.checked)}
            disabled={!requiresConsent}
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            aria-label="Parent or guardian consent"
          />
          <span className="text-muted-foreground">
            My parent or guardian has reviewed GeoGrid's Privacy Policy and consents to my account.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}