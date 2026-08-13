import { NavLink, Navigate, Outlet } from "react-router-dom";
import { Eye, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequireAdminSession } from "@/components/guards";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { ADMIN_HOME_PATH, ADMIN_ACCESS_PATH } from "@/lib/config";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CONSOLE_NAV = [
  { label: "Dashboard", to: ADMIN_HOME_PATH, end: true },
  { label: "Students", to: `${ADMIN_HOME_PATH}/students` },
  { label: "Assignments", to: `${ADMIN_HOME_PATH}/assignments` },
  { label: "Submissions", to: `${ADMIN_HOME_PATH}/submissions` },
  { label: "Payments", to: `${ADMIN_HOME_PATH}/payments` },
  { label: "Users & roles", to: `${ADMIN_HOME_PATH}/users` },
  { label: "Content", to: `${ADMIN_HOME_PATH}/content` },
  { label: "Reports", to: `${ADMIN_HOME_PATH}/reports` },
  { label: "Audit log", to: `${ADMIN_HOME_PATH}/audit-log` },
];

/** Admin console shell — fully separate chrome from marketing site and student app. */
export function ConsoleLayout() {
  const { admin, adminSignOut, impersonating, setImpersonating } = useAdminAuth();

  if (!admin) return <Navigate to={ADMIN_ACCESS_PATH} replace />;

  return (
    <RequireAdminSession>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 border-b bg-card">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-3">
              <svg width={22} height={22} viewBox="0 0 64 64" fill="none" aria-hidden>
                <rect width="64" height="64" rx="14" fill="#3654F4" />
                <path d="M14 24h36M14 32h36M14 40h36M22 24v16M32 24v16M42 24v16" stroke="#FAFAF9" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="font-display text-base font-semibold tracking-tight">GeoGrid Console</span>
              <Badge variant={admin.role === "super_admin" ? "default" : "secondary"} className="hidden sm:inline-flex">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                {admin.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2" aria-label="Admin menu">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{initials(admin.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{admin.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate font-medium">{admin.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{admin.email}</p>
                  <p className="mt-1 text-xs font-normal capitalize text-muted-foreground">
                    {admin.role.replace("_", " ")} · MFA enrolled
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={adminSignOut}>
                  <LogOut className="mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Console navigation">
            {CONSOLE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {impersonating && (
          <div className="flex items-center justify-center gap-2 border-b border-warning/40 bg-warning-muted px-4 py-1.5 text-xs font-medium">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            Impersonating student {impersonating} — every action is audit-logged.
            <button className="underline underline-offset-2" onClick={() => setImpersonating(null)}>
              Stop impersonation
            </button>
          </div>
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </RequireAdminSession>
  );
}