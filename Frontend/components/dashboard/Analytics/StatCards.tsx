import {
  ArrowDown,
  ArrowUp,
  Globe,
  MousePointerClick,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

const icons: Record<(typeof stats)[number]["icon"], LucideIcon> = {
  clicks: MousePointerClick,
  visitors: Users,
  referrer: TrendingUp,
  location: Globe,
};

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = icons[stat.icon];
        const TrendIcon = stat.trend === "up" ? ArrowUp : ArrowDown;

        return (
          <Card key={stat.label} className="overflow-hidden bg-muted/40">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "flex items-center gap-0.5 font-medium",
                      stat.trend === "up" ? "text-primary" : "text-destructive",
                    )}
                  >
                    <TrendIcon className="size-3" />
                    {stat.change}
                  </span>
                  vs prev period
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
