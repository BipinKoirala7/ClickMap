import { Link2 } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "API"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="grid gap-10 sm:grid-cols-3 py-8">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Link2 className="size-4" />
              </span>
              <span className="font-semibold">ClickMap</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Short links, real intelligence. Map every click back to the people
              who matter.
            </p>
          </div>

          <div className="flex sm:justify-evenly gap-16">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-sm font-semibold">{col.heading}</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ClickMap. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
