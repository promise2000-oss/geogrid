import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Alert, AlertDescription, AlertIcon, AlertTitle,
} from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { listAdmins, setAdminRole, allPlatformUsers } from "@/features/console/api";
import { formatDate, initials } from "@/lib/utils";
import type { AdminProfile } from "@/lib/types";

export default function ConsoleUsers() {
  const { admin, writeAudit, requireReauth } = useAdminAuth();
  const [staff, setStaff] = useState<AdminProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    listAdmins().then(setStaff).catch(() => setError("Couldn't load staff accounts."));
  };

  useEffect(reload, []);

  const isSuper = admin?.role === "super_admin";

  const toggleRole = async (target: AdminProfile) => {
    if (!isSuper) {
      toast.error("Only Super Admins can change roles.");
      return;
    }
    if (target.role === "super_admin") {
      toast.error("Cannot demote the last Super Admin — check the audit trail first.");
      return;
    }
    await requireReauth();
    const nextRole = target.role === "admin" ? "super_admin" : "admin";
    await setAdminRole(target.id, nextRole);
    writeAudit({ actorType: "admin", actorId: admin!.id, actorName: admin!.name, action: "admin.role_changed", targetType: "admin", targetId: target.id, ip: "192.168.1.10", userAgent: "Console", metadata: { from: target.role, to: nextRole } });
    toast.success(`${target.name} is now ${nextRole.replace("_", " ")}.`);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Users & roles"
        description="Console staff, RBAC, and every registered account on the platform."
      />

      {!isSuper && (
        <Alert variant="warning" className="mb-6">
          <AlertIcon variant="warning" />
          <AlertTitle>Read-only view</AlertTitle>
          <AlertDescription>
            You're an Admin — role changes require Super Admin privileges. Everything you do here is audit-logged.
          </AlertDescription>
        </Alert>
      )}

      {error && <ErrorState message={error} onRetry={reload} />}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> Console staff</CardTitle>
          <Badge variant="secondary">{staff?.length ?? "…"} accounts</Badge>
        </CardHeader>
        <CardContent>
          {!staff ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff member</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Password reset</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback>{initials(s.name)}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{s.name}{s.id === admin?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.mfaEnrolled ? "success" : "danger"}>{s.mfaEnrolled ? "Enrolled" : "Missing"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.mustResetPassword ? "Required" : "—"}</TableCell>
                    <TableCell className="mono-data text-muted-foreground">{s.lastLoginAt ? formatDate(s.lastLoginAt) : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={s.role === "super_admin" ? "default" : "secondary"}>
                        {s.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isSuper || s.role === "super_admin" || s.id === admin?.id}
                        onClick={() => toggleRole(s)}
                        title={isSuper ? "Toggle role" : "Super Admin only"}
                      >
                        <UserCog className="h-3.5 w-3.5" aria-hidden /> {s.role === "admin" ? "Promote" : "Demote"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><ShieldX className="h-4 w-4 text-muted-foreground" /> Platform accounts</CardTitle>
          <Badge variant="secondary">{allPlatformUsers().length} users</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPlatformUsers().map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{u.role}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}