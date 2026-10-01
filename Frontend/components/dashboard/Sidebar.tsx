"use client";

import Link from "next/link";
import { Link2, LayoutGrid, BarChart2, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Links", href: "/dashboard/links", icon: Link2 },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Shared transition so text collapse is perfectly in sync with rail width
const TRANSITION = "transition-all duration-300 ease-in-out";

function CollapsingLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap",
        TRANSITION,
        collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
      )}
    >
      {children}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "dark flex shrink-0 flex-col justify-between bg-black/90 text-sidebar-foreground",
        TRANSITION,
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div>
        {/* Logo — icon position fixed, only label collapses */}
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Link2 size={18} className="text-sidebar-primary-foreground" />
          </div>
          <CollapsingLabel collapsed={collapsed}>
            <span className="text-lg font-semibold">ClickMap</span>
          </CollapsingLabel>
        </Link>

        {/* Nav */}
        <div className="mt-2 px-4">
          <div
            className={cn(
              "overflow-hidden",
              TRANSITION,
              collapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100",
            )}
          >
            <p className="whitespace-nowrap px-2 pb-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
              Workspace
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <NextLink
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    TRANSITION,
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <CollapsingLabel collapsed={collapsed}>
                    {label}
                  </CollapsingLabel>
                </NextLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User footer — avatar position fixed, only text block collapses */}
      <div className="flex items-center gap-3 border-t border-sidebar-border px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
          AS
        </div>
        <CollapsingLabel collapsed={collapsed}>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Alex Stone</p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              alex@clickmap.io
            </p>
          </div>
        </CollapsingLabel>
      </div>
    </aside>
  );
}
