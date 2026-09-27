"use client";

import { PanelLeft, Search, Bell } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-[#FBF7F0] px-5 py-3">
      <div className="flex items-center gap-3 text-gray-700">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900"
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search links..."
            className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
          />
        </div>
        <button className="relative rounded-lg p-2 hover:bg-black/5">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
      </div>
    </header>
  );
}
