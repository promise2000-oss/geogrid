import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { AtSign, Camera, Mail, MapPin, Phone, Save } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/lib/auth/auth-context";

function OtpCountdown({ expiresAt, onExpired }: { expiresAt: number; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const expired = remaining <= 0;
  useEffect(() => {
    if (expired) onExpired();
  }, [expired, onExpired]);
  const s = Math.ceil(remaining / 1000);
  return (
    <p className="mono-data text-xs text-muted-foreground">
      Code expires in 0:{String(s).padStart(2, "0")}
    </p>
  );
}


export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [dob, setDob] = useState(user?.dob?.slice(0, 10) ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [saving, setSaving] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpExpires, setPhoneOtpExpires] = useState(0);
  const [phoneOtpExpired, setPhoneOtpExpired] = useState(false);
  const [emailVerifyOpen, setEmailVerifyOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const initials = user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      toast.error("Name and username are required.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({ fullName: fullName.trim(), username: username.trim(), bio: bio.trim(), country: country.trim(), dob: dob ? new Date(dob).toISOString() : undefined, phone: phone.trim() || undefined });
    setSaving(false);
    toast.success("Profile updated.");
  };

  const sendPhoneOtp = () => {
    setPhoneOtpSent(true);
    setPhoneOtpExpired(false);
    setPhoneOtpExpires(Date.now() + 60000);
    toast.info(`Demo SMS code sent to ${phone} — code is 123456.`);
  };

  const verifyPhone = () => {
    if (phoneCode.trim() !== "123456") {
      toast.error("That code isn't correct.");
      return;
    }
    updateProfile({ phone });
    setPhoneVerifyOpen(false);
    setPhoneCode("");
    toast.success("Phone number verified.");
  };

  const requestEmailChange = () => {
    setEmailVerifyOpen(true);
  };

  const confirmEmailChange = () => {
    if (emailCode.trim() !== "123456") {
      toast.error("That verification code isn't correct. Check the demo inbox for the code.");
      return;
    }
    updateProfile({ email: pendingEmail! });
    setEmailVerifyOpen(false);
    setNewEmail("");
    setEmailCode("");
    toast.success("Email address updated.");
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="How you appear to tutors and other students — plus your contact details."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" aria-hidden /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile photo</CardTitle>
              <CardDescription>You can't change the color — it's generated from your initials.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Camera className="h-3.5 w-3.5" aria-hidden /> Upload new
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateProfile({ avatarUrl: undefined });
                    toast.success("Profile photo removed.");
                  }}
                >
                  Remove
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    toast.success(`"${f.name}" queued for upload in the real build.`);
                    e.target.value = "";
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pf-name">Full name</Label>
                <Input id="pf-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-username">
                  <AtSign className="mr-1 inline h-3 w-3" aria-hidden />Username
                </Label>
                <Input id="pf-username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pf-bio">Bio</Label>
                <Textarea
                  id="pf-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A line or two about you — shown to your tutor."
                  maxLength={240}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{bio.length}/240 characters</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-dob">Date of birth</Label>
                <Input id="pf-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-country">
                  <MapPin className="mr-1 inline h-3 w-3" aria-hidden />Country
                </Label>
                <Input id="pf-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
              <CardDescription>Used for notifications and the WhatsApp mirror. Changes are verified before they apply.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pf-email">
                  <Mail className="mr-1 inline h-3 w-3" aria-hidden />Email
                </Label>
                <Input id="pf-email" value={user.email} readOnly className="bg-muted/50" />
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={requestEmailChange}
                >
                  Change email address
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-phone">
                  <Phone className="mr-1 inline h-3 w-3" aria-hidden />Phone
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="pf-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={phone.trim().length < 7}
                    onClick={() => setPhoneVerifyOpen(true)}
                  >
                    Verify
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Role: {user.role} · Status: {user.status}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phone OTP */}
      <Dialog open={phoneVerifyOpen} onOpenChange={setPhoneVerifyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify your phone</DialogTitle>
            <DialogDescription>
              We'll send a one-time code to {phone || "your number"} via SMS. In the real build this uses Twilio.
            </DialogDescription>
          </DialogHeader>
          {!phoneOtpSent ? (
            <Button onClick={sendPhoneOtp}>Send code</Button>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pf-otp">One-time code</Label>
                <Input id="pf-otp" inputMode="numeric" maxLength={6} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
              </div>
              {!phoneOtpExpired && phoneOtpExpires > 0 ? (
                <OtpCountdown expiresAt={phoneOtpExpires} onExpired={() => setPhoneOtpExpired(true)} />
              ) : (
                <Button variant="link" size="sm" className="h-auto p-0" onClick={sendPhoneOtp}>Resend code</Button>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhoneVerifyOpen(false)}>Cancel</Button>
            {phoneOtpSent && <Button onClick={verifyPhone}>Verify</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email change */}
      <Dialog open={emailVerifyOpen} onOpenChange={setEmailVerifyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change email address</DialogTitle>
            <DialogDescription>You'll need to confirm both your current password and a code sent to the new address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-new-email">New email</Label>
              <Input
                id="pf-new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {pendingEmail && (
              <div className="space-y-1.5">
                <Label htmlFor="pf-email-code">Verification code sent to {pendingEmail}</Label>
                <Input id="pf-email-code" inputMode="numeric" maxLength={6} value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailVerifyOpen(false)}>Cancel</Button>
            {!pendingEmail ? (
              <Button
                disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)}
                onClick={() => {
                  setPendingEmail(newEmail);
                  toast.info(`Demo verification email sent to ${newEmail} — code is 123456.`);
                }}
              >
                Send code
              </Button>
            ) : (
              <Button onClick={confirmEmailChange}>Confirm change</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}