import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Keyboard, LogOut, Search, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandPalette } from "@/components/shared/command-palette";
import { NotificationBell } from "@/components/shared/notification-bell";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { RequireSession } from "@/components/guards";
import { useAuth } from "@/lib/auth/auth-context";
import { APP_NAV, MOBILE_TABS } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";

const SHORTCUTS: [string, string][] = [
  ["⌘K", "Open command palette"],
  ["? /", "Open this cheat sheet"],
  ["g then d", "Go to dashboard"],
  ["g then a", "Go to assignments"],
];

function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="divide-y">
          {SHORTCUTS.map(([keys, label]) => (
            <li key={keys} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted-foreground">{label}</span>
              <kbd className="mono-data rounded border bg-muted px-2 py-0.5 text-xs">{keys}</kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "?" || e.key === "/") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!user) return null;

  const signOutAll = () => {
    signOut(true);
    navigate("/");
  };

  return (
    <RequireSession>
      <div className="flex min-h-dvh">
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center border-b px-4">
            <a href="/app/dashboard" className="flex items-center gap-2" aria-label="GeoGrid dashboard">
              <svg width={26} height={26} viewBox="0 0 64 64" fill="none" aria-hidden>
                <rect width="64" height="64" rx="14" fill="#3654F4" />
                <path d="M14 24h36M14 32h36M14 40h36M22 24v16M32 24v16M42 24v16" stroke="#FAFAF9" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="font-display text-lg font-semibold tracking-tight">GeoGrid</span>
            </a>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Main navigation">
            {APP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t p-3">
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
          <OfflineBanner />
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
            <div className="flex items-center gap-2">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                    <Search className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex h-16 items-center border-b px-4">
                    <span className="font-display text-lg font-semibold">GeoGrid</span>
                  </div>
                  <nav className="space-y-0.5 p-3" aria-label="Mobile navigation">
                    {APP_NAV.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" aria-hidden />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
                aria-label="Open command palette"
              >
                <Search className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden md:inline">Search GeoGrid…</span>
                <kbd className="mono-data ml-4 rounded border bg-muted px-1.5 text-[10px]">⌘K</kbd>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" onClick={() => setShortcutsOpen(true)}>
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
              </Tooltip>
              <NotificationBell />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label="Account menu">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <UserCircle2 className="h-4 w-4 text-muted-foreground lg:hidden" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="truncate font-medium">{user.fullName}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/app/settings/profile")}>Profile settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/app/settings/account")}>Account & security</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOutAll}>
                    <LogOut className="mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-8" key={location.pathname}>
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card/95 backdrop-blur lg:hidden"
          aria-label="Bottom navigation"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {MOBILE_TABS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </RequireSession>
  );
}