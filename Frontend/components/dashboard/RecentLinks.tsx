"use client";

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LinkStatus = "active" | "paused" | "expired";

type LinkRow = {
  shortUrl: string;
  original: string;
  clicks: number;
  status: LinkStatus;
  created: string;
};

const links: LinkRow[] = [
  {
    shortUrl: "clk.mp/launch",
    original: "https://acme.com/product-launch-2026-spring-collection",
    clicks: 12480,
    status: "active",
    created: "2026-06-12",
  },
  {
    shortUrl: "clk.mp/docs",
    original: "https://docs.acme.com/getting-started",
    clicks: 5320,
    status: "active",
    created: "2026-06-09",
  },
  {
    shortUrl: "clk.mp/sale",
    original: "https://shop.acme.com/summer-sale",
    clicks: 9870,
    status: "active",
    created: "2026-06-05",
  },
  {
    shortUrl: "clk.mp/webinar",
    original: "https://acme.com/events/webinar-june",
    clicks: 2140,
    status: "paused",
    created: "2026-06-01",
  },
  {
    shortUrl: "clk.mp/beta",
    original: "https://beta.acme.com/signup",
    clicks: 780,
    status: "expired",
    created: "2026-05-22",
  },
];

const statusStyles: Record<LinkStatus, string> = {
  active: "bg-primary/10 text-primary",
  paused: "bg-secondary text-secondary-foreground",
  expired: "bg-muted text-muted-foreground",
};

export default function RecentLinks() {
  return (
    <div className="rounded-2xl bg-muted/40 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent links
          </h2>
          <p className="text-xs text-muted-foreground">
            Your most recently created links
          </p>
        </div>
        <Button className="px-4 py-1.5 text-sm font-medium bg-transparent text-foreground hover:bg-accent">
          View all
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Short URL
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Original
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Clicks
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Status
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Created
              </th>
              <th className="w-8 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                key={link.shortUrl}
                className="border-b border-border/60 last:border-0 hover:bg-accent/60"
              >
                <td className="whitespace-nowrap py-3 pr-2 font-mono text-foreground">
                  {link.shortUrl}
                </td>
                <td className="max-w-70 truncate py-3 pr-2 text-muted-foreground">
                  {link.original}
                </td>
                <td className="whitespace-nowrap py-3 pr-2 text-foreground">
                  {link.clicks.toLocaleString()}
                </td>
                <td className="whitespace-nowrap py-3 pr-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                      statusStyles[link.status],
                    )}
                  >
                    {link.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-2 text-muted-foreground">
                  {link.created}
                </td>
                {/* Change from this more options button to a link to the links analytics page */}
                <td className="py-3 px-3 flex align-center justify-center">
                  <button
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
