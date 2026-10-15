import { activateLink, deactivateLink } from "@/api/link/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkWithClickCountAndUniqueCount } from "@/types";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function LinksPage({
  link,
}: {
  link: LinkWithClickCountAndUniqueCount;
}) {
  function handleCopy(shortCode: string) {
    navigator.clipboard?.writeText(`https://${shortCode}`);
    toast.success("Short link copied to clipboard!");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${link.shortCode}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleCopy(link.shortCode)}
        >
          <Copy />
          Copy short link
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink />
            Open original
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <a
            href={`/dashboard/links/${link.id}/edit`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <Pencil />
            Edit
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {link.isActive ? (
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={() => deactivateLink(link.id)}
          >
            <Trash2 />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            variant="default"
            className="cursor-pointer"
            onClick={() => activateLink(link.id)}
          >
            <Trash2 />
            Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
