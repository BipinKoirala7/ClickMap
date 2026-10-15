"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getRecentLinks } from "@/api/analytics/overviewAnalytics";
import { LinkWithClickCountAndUniqueCount } from "@/types";
import Link from "next/link";
import LinkOptions from "./Links/LinkOptions";
import StatusBadge, {
  getLinkStatus,
} from "@/components/dashboard/Links/StatusBadge";
import { formatDate } from "@/lib/lib";

function Header({ showViewAll = false }: { showViewAll?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Recent links</h2>
        <p className="text-xs text-muted-foreground">
          Your most recently created links
        </p>
      </div>
      {showViewAll && (
        <Link href="/dashboard/links">
          <Button
            variant="ghost"
            className="px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            View all
          </Button>
        </Link>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-muted/40 p-6">
      {children}
    </div>
  );
}

export default function RecentLinks() {
  const { isLoading, data, isError } = useQuery<
    LinkWithClickCountAndUniqueCount[]
  >({
    queryKey: ["recent-links"],
    queryFn: getRecentLinks,
  });

  if (isLoading) {
    return (
      <Shell>
        <Header />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell>
        <Header />
        <div className="flex h-32 items-center justify-center text-destructive">
          Failed to load links. Please try again later.
        </div>
      </Shell>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Shell>
        <Header />
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          No links found. Create a new link to get started.
        </div>
      </Shell>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/40">
      <div className="border-b p-4">
        <Header showViewAll />
      </div>

      <Table className="bg-muted/40">
        <TableHeader>
          <TableRow>
            <TableHead className="h-12 px-4 text-muted-foreground">
              Short URL
            </TableHead>
            <TableHead className="h-12 px-4 text-muted-foreground">
              Original URL
            </TableHead>
            <TableHead className="h-12 px-4 text-right text-muted-foreground">
              Clicks
            </TableHead>
            <TableHead className="h-12 px-4 text-right text-muted-foreground">
              Unique
            </TableHead>
            <TableHead className="h-12 px-4 text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-12 px-4 text-muted-foreground">
              Created
            </TableHead>
            <TableHead className="h-12 px-4 text-muted-foreground">
              Updated
            </TableHead>
            <TableHead className="h-12 px-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((link) => (
            <TableRow key={link.id ?? link.shortCode} className="h-17.75">
              <TableCell className="px-4 font-mono font-medium">
                {link.shortCode}
              </TableCell>
              <TableCell className="max-w-70 truncate px-4 text-muted-foreground">
                {link.originalUrl}
              </TableCell>
              <TableCell className="px-4 text-right font-mono tabular-nums">
                {link.clicks}
              </TableCell>
              <TableCell className="px-4 text-right font-mono tabular-nums">
                {link.uniqueClicks}
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge status={getLinkStatus(link)} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 text-muted-foreground">
                {formatDate(link.createdAt)}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 text-muted-foreground">
                {formatDate(link.updatedAt)}
              </TableCell>
              <TableCell className="px-4">
                <LinkOptions link={link} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
