import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Copy, KeyRound, Laptop, MonitorSmartphone, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";

interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const SESSIONS: DeviceSession[] = [
  { id: "s-1", device: "Chrome · Linux", location: "Lagos, NG", lastActive: "Just now", current: true },
  { id: "s-2", device: "Android · WhatsApp Web", location: "Lagos, NG", lastActive: "2 hours ago", current: false },
  { id: "s-3", device: "Safari · iPhone", location: "Accra, GH", lastActive: "3 days ago", current: false },
];

const LOGIN_ACTIVITY = [
  { date: "Today, 08:42", location: "Lagos, NG", device: "Chrome · Linux", success: true },
  { date: "Yesterday, 19:15", location: "Lagos, NG", device: "Android · WhatsApp Web", success: true },
  { date: "3 days ago, 09:02", location: "Accra, GH", device: "Safari · iPhone", success: true },
  { date: "6 days ago, 23:40", location: "Unknown", device: "Chrome · Windows", success: false },
];

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Very strong"];
  return { score, label: labels[score]! };
}

export default function Security() {
  const { changePassword, signOut } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFaDialog, setTwoFaDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  const strength = useMemo(() => passwordStrength(next), [next]);

  const handleChangePassword = async () => {
    if (next !== confirm) {
      toast.error("New passwords don't match.");
      return;
    }
    setChanging(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated. Sign in on other devices was not required — you can end those sessions below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't change the password.");
    } finally {
      setChanging(false);
    }
  };

  const enableTwoFactor = () => {
    setBackupCodes([
      "GK7Q-4MP2-RT9X",
      "7L2D-KQ8N-VB5C",
      "3FT9-ZW1E-HX4K",
      "M8PB-6SD2-JC7N",
      "Q4RA-9TL3-UF6W",
      "2NX5-GH7C-RE1D",
    ]);
    setTwoFactor(true);
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session ended.");
  };

  return (
    <div>
      <PageHeader
        title="Security"
        description="Password, two-factor authentication, and everywhere you're signed in."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> Change password</CardTitle>
            <CardDescription>Use at least 8 characters with a mix of cases, numbers, and symbols.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sec-current">Current password</Label>
              <Input id="sec-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sec-next">New password</Label>
              <Input id="sec-next" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
              {next && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Strength</span>
                    <span className="font-medium">{strength.label}</span>
                  </div>
                  <div className="mt-1 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < strength.score ? (strength.score >= 4 ? "bg-success" : strength.score >= 3 ? "bg-primary" : strength.score >= 2 ? "bg-warning" : "bg-danger") : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sec-confirm">Confirm new password</Label>
              <Input id="sec-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            <Button onClick={handleChangePassword} disabled={changing || !current || !next || !confirm}>
              {changing ? "Updating…" : "Update password"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> Two-factor authentication</CardTitle>
            <CardDescription>Protect your account with a one-time code from an authenticator app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Authenticator app</p>
                  <p className="text-xs text-muted-foreground">{twoFactor ? "Enabled — codes required on new sign-ins" : "Not enabled"}</p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={() => setTwoFaDialog(true)} aria-label="Toggle two-factor authentication" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              GeoGrid uses TOTP (RFC 6238) — compatible with Google Authenticator, Authy, and 1Password.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-muted-foreground" /> Active sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    {s.device.includes("iPhone") ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Laptop className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium">
                        {s.device}
                        {s.current && <Badge variant="secondary" className="ml-2">This device</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.lastActive}</p>
                    </div>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)}>End session</Button>
                  )}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { signOut(true); toast.info("Signing out everywhere…"); }}>
              Sign out everywhere
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldOff className="h-4 w-4 text-muted-foreground" /> Login activity</CardTitle>
            <CardDescription>Recent sign-ins to your account. Contact support if you see one you don't recognize.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LOGIN_ACTIVITY.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell className="mono-data">{l.date}</TableCell>
                    <TableCell className="text-muted-foreground">{l.location}</TableCell>
                    <TableCell className="text-muted-foreground">{l.device}</TableCell>
                    <TableCell className="text-right">
                      {l.success ? (
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3" aria-hidden /> Success</Badge>
                      ) : (
                        <Badge variant="danger">Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={twoFaDialog} onOpenChange={setTwoFaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{twoFactor ? "Disable two-factor authentication?" : "Enable two-factor authentication"}</DialogTitle>
            <DialogDescription>
              {twoFactor
                ? "You'll need to re-authenticate with a code to confirm. Sign-ins on other devices stay active."
                : "Scan this code with your authenticator app, then enter the 6-digit code to confirm."}
            </DialogDescription>
          </DialogHeader>
          {!twoFactor && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-lg border bg-muted/50">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground" aria-hidden />
                </div>
              </div>
              <p className="text-center mono-data text-sm text-muted-foreground">geogrid://totp/maya@geogrid.test</p>
              <Input placeholder="6-digit code (demo: 123456)" inputMode="numeric" maxLength={6} className="text-center" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTwoFaDialog(false)}>Cancel</Button>
            {!twoFactor ? (
              <Button onClick={enableTwoFactor}>Enable 2FA</Button>
            ) : (
              <Button variant="destructive" onClick={() => { setTwoFactor(false); setTwoFaDialog(false); toast.success("Two-factor authentication disabled."); }}>
                Disable 2FA
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!backupCodes} onOpenChange={(open) => { if (!open) setBackupCodes(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save your backup codes</DialogTitle>
            <DialogDescription>
              Each code works once, and only when you're locked out of your authenticator. Store them somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes?.map((c) => (
              <code key={c} className="mono-data rounded-md bg-muted px-2 py-2 text-center text-xs">{c}</code>
            ))}
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText((backupCodes ?? []).join("\n"));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden /> {copied ? "Copied" : "Copy all"}
            </Button>
            <Button onClick={() => { setBackupCodes(null); toast.success("Two-factor authentication enabled."); }}>I've saved them</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}