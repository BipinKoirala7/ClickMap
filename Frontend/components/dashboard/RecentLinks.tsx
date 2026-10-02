"use client";

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecentLinks } from "@/api/link/link";

type LinkStatus = "active" | "paused" | "expired";

const statusStyles: Record<LinkStatus, string> = {
  active: "bg-active text-active-foreground",
  paused: "bg-inactive text-inactive-foreground",
  expired: "bg-muted text-muted-foreground",
};

export default function RecentLinks() {
  const { isLoading, data, isError } = useQuery({
    queryKey: ["recent-links"],
    queryFn: getRecentLinks,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error Loading Data...</div>;
  }

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
        {data != undefined ? (
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
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No links created yet
                  </td>
                </tr>
              ) : (
                data.map((link) => (
                  <tr
                    key={link.shortCode}
                    className="border-b border-border/60 last:border-0 hover:bg-accent/60"
                  >
                    <td className="whitespace-nowrap py-3 pr-2 font-mono text-foreground">
                      {link.originalUrl}
                    </td>
                    <td className="max-w-70 truncate py-3 pr-2 text-muted-foreground">
                      {link.originalUrl}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-2 text-foreground">
                      {new Date(link.createdAt.toLocaleString())}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          statusStyles["active"],
                        )}
                      >
                        {link.isActive}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-2 text-muted-foreground">
                      {new Date(link.updatedAt.toLocaleDateString())}
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
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div>No Links Created</div>
        )}
      </div>
    </div>
  );
}
