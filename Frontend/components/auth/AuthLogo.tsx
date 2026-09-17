import { Link2 } from "lucide-react";
import Link from "next/link";

export default function AuthLogo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Link2 className="size-4" />
      </span>
      <span className="text-lg font-semibold">ClickMap</span>
    </Link>
  );
}
