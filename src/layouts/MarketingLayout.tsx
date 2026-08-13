import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { WHATSAPP_SUPPORT } from "@/lib/config";

const NAV = [
  { label: "Product", to: "/#product" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="GeoGrid home">
      <svg width={size === "lg" ? 34 : 28} height={size === "lg" ? 34 : 28} viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#3654F4" />
        <path d="M14 24h36M14 32h36M14 40h36M22 24v16M32 24v16M42 24v16" stroke="#FAFAF9" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className={`font-display font-semibold tracking-tight ${size === "lg" ? "text-2xl" : "text-lg"}`}>GeoGrid</span>
    </Link>
  );
}

export function MarketingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.label} href={item.to} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Start free trial</Link>
            </Button>
          </div>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                  {NAV.map((item) => (
                    <a
                      key={item.label}
                      href={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <Button asChild variant="outline">
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        Start free trial
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The academic operating system for WhatsApp-based tutoring. Assignments, grading, billing, and records —
              without leaving WhatsApp for the conversation.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-foreground">Acceptable Use</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Get in touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp support
                </a>
              </li>
              <li><a href="mailto:hello@geogrid.example" className="hover:text-foreground">hello@geogrid.example</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GeoGrid. All rights reserved.
        </div>
      </footer>
    </div>
  );
}