import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClickMap",
  description:
    "ClickMap is a powerful and user-friendly tool that allows you to create interactive heatmaps for your website. With ClickMap, you can easily visualize user interactions, track clicks, and gain valuable insights into user behavior. Whether you're a marketer, UX designer, or website owner, ClickMap provides the data you need to optimize your website's performance and enhance user experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
