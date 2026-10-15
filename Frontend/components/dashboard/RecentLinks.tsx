"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecentLinks } from "@/api/analytics/overviewAnalytics";
import { LinkWithClickCountAndUniqueCount } from "@/types";
import Link from "next/link";
import LinkOptions from "./Links/LinkOptions";

type LinkStatus = "active" | "paused" | "expired";

const statusStyles: Record<LinkStatus, string> = {
  active: "bg-primary/20 text-primary",
  paused: "bg-inactive text-inactive-foreground",
  expired: "bg-muted text-muted-foreground",
};

export default function RecentLinks() {
  const { isLoading, data, isError } = useQuery<
    LinkWithClickCountAndUniqueCount[]
  >({
    queryKey: ["recent-links"],
    queryFn: getRecentLinks,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent links
            </h2>
            <p className="text-xs text-muted-foreground">
              Your most recently created links
            </p>
          </div>
        </div>
        <div className="h-32 w-full rounded bg-muted animate-pulse"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent links
            </h2>
            <p className="text-xs text-muted-foreground">
              Your most recently created links
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent links
            </h2>
            <p className="text-xs text-muted-foreground">
              Your most recently created links
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Recent links data:", data);

  return (
    <div className="rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent links
          </h2>
          <p className="text-xs text-muted-foreground">
            Your most recently created links
          </p>
        </div>
        <Link href="/dashboard/links">
          <Button className="px-4 py-1.5 text-sm font-medium bg-transparent text-foreground hover:bg-accent">
            View all
          </Button>
        </Link>
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
                Unique
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Status
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Created
              </th>
              <th className="whitespace-nowrap py-2 pr-2 font-medium">
                Updated
              </th>
              <th className="w-8 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((link) => (
              <tr
                key={link.shortCode}
                className="border-b border-border/60 last:border-0 hover:bg-accent/60"
              >
                <td className="whitespace-nowrap py-3 pr-2 font-mono text-foreground">
                  {link.shortCode}
                </td>
                <td className="max-w-70 truncate py-3 pr-2 text-muted-foreground">
                  {link.originalUrl}
                </td>
                <td className="max-w-70 w-fit truncate py-3 pr-2 text-muted-foreground px-4">
                  {link.clicks}
                </td>
                <td className="whitespace-nowrap py-3 pr-2 text-foreground px-4">
                  {link.uniqueClicks}
                </td>
                <td className="whitespace-nowrap py-3 pr-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                      link.isActive
                        ? statusStyles["active"]
                        : statusStyles["paused"],
                    )}
                  >
                    {new Date(link.updatedAt) > new Date(link.expiresAt)
                      ? "expired"
                      : link.isActive
                        ? "active"
                        : "paused"}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-2 text-muted-foreground">
                  {new Date(link.updatedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 px-3 flex align-center justify-center">
                  <LinkOptions link={link} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
