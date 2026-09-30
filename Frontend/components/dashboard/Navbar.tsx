"use client";

import { PanelLeft, Search } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import Notification from "@/components/dashboard/Notification";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between bg-muted/40 px-6 py-3">
      <div className="flex items-center gap-3 text-foreground">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>
        <span className="text-sm font-medium">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search links..."
            className="w-64 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <Notification />
      </div>
    </header>
  );
}
