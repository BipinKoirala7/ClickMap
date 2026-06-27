import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LinkStatus } from "@/lib/mock-data";

const statusStyles: Record<LinkStatus, string> = {
  active: "bg-primary/15 text-primary hover:bg-primary/15",
  paused: "bg-muted text-muted-foreground hover:bg-muted",
  expired: "bg-muted/60 text-muted-foreground/70 hover:bg-muted/60",
};

export function LinkStatusBadge({ status }: { status: LinkStatus }) {
  return (
    <Badge variant="secondary" className={cn(statusStyles[status])}>
      {status}
    </Badge>
  );
}
