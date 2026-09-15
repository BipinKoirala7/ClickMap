import { Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DefaultCard from "@/components/AppUI/DefaultCard";

const stats = [
  { label: "Clicks", value: "12,480" },
  { label: "Visitors", value: "8,421" },
  { label: "Countries", value: "37" },
];

export default function HeroDemoCard() {
  const header = (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Link2 className="size-3.5" />
      </span>
      Shorten a URL
    </div>
  );

  return (
    <DefaultCard
      className="w-full max-w-md"
      header={header}
      contentClassName="flex flex-col gap-3"
    >
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="https://your-very-long-url.example.com/with/path"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <Button size="sm" className="shrink-0">
          Shorten
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 font-mono text-sm">
        <span>clk.mp/launch</span>
        <button
          type="button"
          aria-label="Copy short link"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border px-2 py-3 text-center"
          >
            <div className="text-lg font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </DefaultCard>
  );
}
