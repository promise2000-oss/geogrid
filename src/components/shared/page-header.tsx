import { useSeo } from "@/lib/seo";

interface PageHeaderProps {
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function PageHeader({ title, description, seoTitle, seoDescription, actions, breadcrumb }: PageHeaderProps) {
  useSeo(seoTitle ?? title, seoDescription ?? description);
  return (
    <div className="mb-6 space-y-3">
      {breadcrumb}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display-tight font-display text-2xl font-semibold">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}