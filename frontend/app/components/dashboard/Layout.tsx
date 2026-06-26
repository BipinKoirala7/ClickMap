import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import DashboardSidebar from "~/components/dashboard/DashboardSidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b border-border px-4 py-5">
          {/* <div>Bipin Koirala</div> */}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
