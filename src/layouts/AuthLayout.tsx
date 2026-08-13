import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="GeoGrid home">
          <svg width={28} height={28} viewBox="0 0 64 64" fill="none" aria-hidden>
            <rect width="64" height="64" rx="14" fill="#3654F4" />
            <path d="M14 24h36M14 32h36M14 40h36M22 24v16M32 24v16M42 24v16" stroke="#FAFAF9" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-display text-lg font-semibold tracking-tight">GeoGrid</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        <span className="mx-2" aria-hidden>·</span>
        <Link to="/terms" className="hover:text-foreground">Terms</Link>
        <span className="mx-2" aria-hidden>·</span>
        <Link to="/contact" className="hover:text-foreground">Contact</Link>
      </footer>
    </div>
  );
}