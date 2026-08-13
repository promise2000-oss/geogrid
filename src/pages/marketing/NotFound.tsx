import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/seo";

export default function NotFound() {
  useSeo("Page not found");
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Compass className="h-6 w-6 text-muted-foreground" aria-hidden />
      </span>
      <p className="mono-data mt-6 text-sm font-semibold text-primary">404</p>
      <h1 className="display-tight mt-2 font-display text-4xl font-semibold">This page drifted off the grid</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Here's how to get back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg"><Link to="/">Back to home</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/app/dashboard">Open your dashboard</Link></Button>
      </div>
    </div>
  );
}