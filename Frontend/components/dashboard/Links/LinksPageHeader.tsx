import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function LinksPageHeader() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Links</h1>
          <p className="mt-1.5 text-muted-foreground">
            Manage every short link in your workspace.
          </p>
        </div>
        <Button size="lg" className="self-start sm:self-auto">
          <Plus />
          Create link
        </Button>
      </div>
    </>
  );
}

export default LinksPageHeader;
