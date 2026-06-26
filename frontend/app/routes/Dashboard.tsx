import {
  LuLink2,
  LuMousePointerClick,
  LuTrendingUp,
  LuActivity,
} from "react-icons/lu";
import { Outlet } from "react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import DashboardSidebar from "~/components/dashboard/DashboardSidebar";

const stats = [
  { label: "Total Links", value: "1,284", change: "+12.4%", icon: LuLink2 },
  {
    label: "Total Clicks",
    value: "248,910",
    change: "+8.1%",
    icon: LuMousePointerClick,
  },
  { label: "Active Links", value: "1,128", change: "+3.2%", icon: LuActivity },
  { label: "Click Rate", value: "62.4%", change: "+1.8%", icon: LuTrendingUp },
];

export default function DashboardOverview() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          {/* breadcrumb / search / notifications can go here */}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
