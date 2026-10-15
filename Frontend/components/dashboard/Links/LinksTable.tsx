"use client";

import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Download,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserLinks } from "@/api/link/link";
import { useQuery } from "@tanstack/react-query";
import { LinkWithClickCountAndUniqueCount } from "@/types";
import { useState } from "react";
import LinkOptions from "./LinkOptions";
import StatusBadge, {
  getLinkStatus,
} from "@/components/dashboard/Links/StatusBadge";
import { formatDate } from "@/lib/lib";

const PAGE_SIZE = 10;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-col gap-5 rounded-xl border bg-muted/40 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">All links</h2>
        <p className="text-xs text-muted-foreground">
          Every link you have created
        </p>
      </div>
      {children}
    </div>
  );
}

function LinksTable() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { isLoading, data, isError } = useQuery<
    LinkWithClickCountAndUniqueCount[]
  >({
    // distinct from RecentLinks' ["recent-links"] so the two caches don't collide
    queryKey: ["links"],
    queryFn: getUserLinks,
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell>
        <div className="flex h-32 items-center justify-center text-destructive">
          Failed to load links. Please try again later.
        </div>
      </Shell>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Shell>
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          No links found. Create a new link to get started.
        </div>
      </Shell>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = data.filter(
    (l) =>
      l.shortCode.toLowerCase().includes(q) ||
      l.originalUrl.toLowerCase().includes(q),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="mt-8 overflow-hidden rounded-xl border bg-muted/40">
      <div className="flex items-center gap-2 border-b p-3 sm:p-4">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by short or original URL..."
            aria-label="Search links"
            className="h-10 pl-9"
          />
        </div>
        <Button variant="outline" className="h-10">
          <ListFilter />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button variant="outline" className="h-10">
          <Download />
          <span className="hidden sm:inline">Export</span>
        </Button>
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
            <TableHead className="h-12 w-12 px-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="h-32 text-center text-muted-foreground"
              >
                No links match &ldquo;{query}&rdquo;. Try a different short or
                original URL.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((link) => (
              <TableRow key={link.id} className="h-17.75">
                <TableCell className="px-4 font-mono font-medium">
                  {link.shortCode}
                </TableCell>
                <TableCell className="px-4 text-muted-foreground">
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
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} of {filtered.length}
        </p>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft />
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === currentPage ? "outline" : "ghost"}
              size="icon"
              aria-current={n === currentPage ? "page" : undefined}
              onClick={() => setPage(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="ghost"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight />
          </Button>
        </nav>
      </div>
    </div>
  );
}

export default LinksTable;
