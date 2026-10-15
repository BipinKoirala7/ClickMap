import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

type LinkStatus = "active" | "paused" | "expired";

const STATUS_STYLES: Record<LinkStatus, string> = {
  active: "bg-primary/15 text-primary",
  paused: "bg-muted text-muted-foreground",
  expired: "bg-destructive text-white",
};

export function getLinkStatus(link: {
  expiresAt: string | Date;
  isActive: boolean;
}): LinkStatus {
  if (new Date(link.expiresAt) <= new Date()) return "expired";
  return link.isActive ? "active" : "paused";
}

function StatusBadge({ status }: { status: LinkStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </Badge>
  );
}

export default StatusBadge;
