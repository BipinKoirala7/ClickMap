import { Link } from "react-router";
import { IoLink } from "react-icons/io5";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-display font-bold text-lg ${className}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <IoLink className="h-4 w-4" />
      </span>
      <span>ClickMap</span>
    </Link>
  );
}
