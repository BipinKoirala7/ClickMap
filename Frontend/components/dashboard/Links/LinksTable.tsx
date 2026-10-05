"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  ListFilter,
  MoreHorizontal,
  Download,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type LinkStatus = "active" | "paused" | "expired";

type ShortLink = {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  unique: number;
  status: LinkStatus;
  createdAt: string; // ISO date
};

// TODO: replace with real data from your API
const LINKS: ShortLink[] = [
  {
    id: "1",
    shortUrl: "clk.mp/launch",
    originalUrl: "https://acme.com/product-launch-2026-spring-collection",
    clicks: 12480,
    unique: 8421,
    status: "active",
    createdAt: "2026-06-12",
  },
  {
    id: "2",
    shortUrl: "clk.mp/docs",
    originalUrl: "https://docs.acme.com/getting-started",
    clicks: 5320,
    unique: 3110,
    status: "active",
    createdAt: "2026-06-08",
  },
  {
    id: "3",
    shortUrl: "clk.mp/sale",
    originalUrl: "https://shop.acme.com/summer-sale",
    clicks: 9870,
    unique: 6543,
    status: "active",
    createdAt: "2026-06-03",
  },
  {
    id: "4",
    shortUrl: "clk.mp/webinar",
    originalUrl: "https://acme.com/events/webinar-june",
    clicks: 2140,
    unique: 1980,
    status: "paused",
    createdAt: "2026-06-01",
  },
  {
    id: "5",
    shortUrl: "clk.mp/beta",
    originalUrl: "https://beta.acme.com/signup",
    clicks: 780,
    unique: 612,
    status: "expired",
    createdAt: "2026-05-22",
  },
  {
    id: "6",
    shortUrl: "clk.mp/hire",
    originalUrl: "https://careers.acme.com",
    clicks: 3320,
    unique: 2880,
    status: "active",
    createdAt: "2026-05-18",
  },
  {
    id: "7",
    shortUrl: "clk.mp/blog",
    originalUrl: "https://blog.acme.com/how-we-scaled-redis",
    clicks: 4421,
    unique: 3201,
    status: "active",
    createdAt: "2026-05-10",
  },
];

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<LinkStatus, string> = {
  active: "bg-primary/15 text-primary",
  paused: "bg-muted text-muted-foreground",
  expired: "bg-destructive text-white",
};

const numberFormat = new Intl.NumberFormat("en-US");

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function LinksTable() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LINKS;
    return LINKS.filter(
      (l) =>
        l.shortUrl.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q),
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleCopy(shortUrl: string) {
    navigator.clipboard?.writeText(`https://${shortUrl}`);
  }

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
          <TableRow className="">
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
            <TableHead className="h-12 w-12 px-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={7}
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
                  {link.shortUrl}
                </TableCell>
                <TableCell className="px-4 text-muted-foreground">
                  {link.originalUrl}
                </TableCell>
                <TableCell className="px-4 text-right font-mono tabular-nums">
                  {numberFormat.format(link.clicks)}
                </TableCell>
                <TableCell className="px-4 text-right font-mono tabular-nums">
                  {numberFormat.format(link.unique)}
                </TableCell>
                <TableCell className="px-4">
                  <StatusBadge status={link.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 text-muted-foreground">
                  {formatDate(link.createdAt)}
                </TableCell>
                <TableCell className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${link.shortUrl}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleCopy(link.shortUrl)}
                      >
                        <Copy />
                        Copy short link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink />
                          Open original
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
