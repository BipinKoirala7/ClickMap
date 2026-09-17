import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroDemoCard from "./HeroDemoCard";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-32">
      <div>
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          v2 with real-time analytics
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Short links.
          <br />
          <span className="text-primary">Real intelligence.</span>
        </h1>

        <p className="mt-6 max-w-md text-muted-foreground">
          ClickMap turns every URL into a measurable touchpoint. Shorten, brand,
          and route links — then watch every click resolve into people, places,
          and revenue.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/signup">
            <Button size="lg">Get started</Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          No credit card · 10,000 clicks/mo on free
        </p>
      </div>

      <div className="flex justify-center md:justify-end">
        <HeroDemoCard />
      </div>
    </section>
  );
}
