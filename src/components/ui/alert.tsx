import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      info: "border-primary/30 bg-primary/5 text-foreground [&>svg]:text-primary",
      success: "border-success/30 bg-success-muted text-foreground [&>svg]:text-success",
      warning: "border-warning/40 bg-warning-muted text-foreground [&>svg]:text-warning",
      danger: "border-danger/40 bg-danger-muted text-foreground [&>svg]:text-danger",
    },
  },
  defaultVariants: { variant: "default" },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export function AlertIcon({ variant }: { variant: VariantProps<typeof alertVariants>["variant"] }) {
  switch (variant) {
    case "danger":
      return <AlertCircle className="h-4 w-4" aria-hidden />;
    case "warning":
      return <TriangleAlert className="h-4 w-4" aria-hidden />;
    case "success":
      return <CheckCircle2 className="h-4 w-4" aria-hidden />;
    default:
      return <Info className="h-4 w-4" aria-hidden />;
  }
}

export { Alert, AlertTitle, AlertDescription };