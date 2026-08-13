import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useSeo } from "@/lib/seo";

/** Temporary stub — replaced as phases land. */
export function StubPage({ title }: { title: string }) {
  useSeo(title);
  return (
    <div className="py-10">
      <EmptyState
        icon={FileQuestion}
        title={`${title} — scaffolding in progress`}
        description="This route is wired into the router and will be implemented in the current build phase."
      />
    </div>
  );
}