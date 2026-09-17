import AuthLogo from "@/components/auth/AuthLogo";

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-6 py-12">
      <AuthLogo />
      {children}
    </div>
  );
}
