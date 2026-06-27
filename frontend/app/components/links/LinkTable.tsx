import { LuPencil, LuTrash2, LuCopy } from "react-icons/lu";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkStatusBadge } from "@/components/links/LinksStatusBadge";
import { toast } from "sonner";
import type { Link } from "@/lib/mock-data";

interface LinksTableProps {
  links: Link[];
}

export function LinksTable({ links }: LinksTableProps) {
  function handleCopy(short: string) {
    navigator.clipboard.writeText(`https://${short}`);
    toast.success("Link copied to clipboard");
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short URL</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Unique</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-mono font-medium">{l.short}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {l.original}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {l.clicks.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {l.uniqueVisitors.toLocaleString()}
              </TableCell>
              <TableCell>
                <LinkStatusBadge status={l.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {l.createdAt}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="size-8">
                      <FiMoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopy(l.short)}>
                      <LuCopy className="size-4" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LuPencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <LuTrash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
