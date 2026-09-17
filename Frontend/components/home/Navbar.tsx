import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const navLinks = ["Features", "Pricing"];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {" "}
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-4" />
          </span>
          <span className="text-base font-semibold">ClickMap</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <span className="hidden h-6 w-px bg-border md:inline-block" />
          <Link href="/auth/register">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
