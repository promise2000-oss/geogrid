import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function Breadcrumb({ children, className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground", className)} {...props}>
      <ol className="flex items-center gap-1.5">{children}</ol>
    </nav>
  );
}

function BreadcrumbItem({ children, href, className, ...props }: React.ComponentProps<"a">) {
  const isLink = !!href;
  return (
    <li className="flex items-center gap-1.5">
      {isLink ? (
        <a href={href} className={cn("transition-colors hover:text-foreground", className)} {...props}>
          {children}
        </a>
      ) : (
        <span aria-current="page" className={cn("text-foreground", className)} {...props}>
          {children}
        </span>
      )}
      {isLink && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
    </li>
  );
}

export { Breadcrumb, BreadcrumbItem };