import { useMemo, useState } from "react";
import { Link } from "react-router";
import { FiArrowRight, FiLink, FiCopy, FiCheck } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const shortened = useMemo(
    () =>
      url
        ? "clk.mp/" + Math.random().toString(36).slice(2, 8)
        : "clk.mp/launch",
    [url],
  );

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary),transparent_70%)]/12" />
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge
              variant="secondary"
              className="mb-5 rounded-full bg-secondary text-secondary-foreground"
            >
              <HiSparkles className="mr-1 h-3 w-3 text-primary" /> Coming Soon:
              v2 with real-time analytics
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Short links.
              <br />
              <span className="text-primary">Real intelligence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              ClickMap turns every URL into a measurable touch point. Shorten,
              brand, and route links — then watch every click resolve into
              people, places, and revenue.
            </p>
            <div className="mt-8 flex flex-nowrap items-center gap-3">
              <Button size="lg">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center whitespace-nowrap"
                >
                  Start free <FiArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                <Link to="/dashboard">View live demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card · 5 live links for free
            </p>
          </div>

          <Card className="border-border/80 bg-card shadow-[0_30px_80px_-30px_oklch(0.215_0.005_60/0.25)]">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
                  <FiLink className="h-3 w-3" />
                </span>
                Shorten a URL
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://your-very-long-url.example.com/with/path"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button>Shorten</Button>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border bg-secondary/40 px-4 py-3">
                <span className="font-mono text-sm font-medium text-foreground">
                  {shortened}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(shortened);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? (
                    <FiCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <FiCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Clicks", value: "12,480" },
                  { label: "Visitors", value: "8,421" },
                  { label: "Countries", value: "37" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-md border border-border/70 bg-background py-3"
                  >
                    <div className="font-display text-xl font-bold text-foreground">
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
