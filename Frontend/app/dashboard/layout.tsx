import { getUser } from "@/api/user/dal";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/context/sidebar-context";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/lib";

export const metadata: Metadata = {
  title: "ClickMap | Dashboard",
  description:
    "ClickMap is a powerful and user-friendly tool that allows you to create interactive heatmaps for your website. With ClickMap, you can easily visualize user interactions, track clicks, and gain valuable insights into user behavior. Whether you're a marketer, UX designer, or website owner, ClickMap provides the data you need to optimize your website's performance and enhance user experience.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect(ROUTES.AUTH.LOGIN);
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
