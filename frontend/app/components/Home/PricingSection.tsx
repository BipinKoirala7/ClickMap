import { Link } from "react-router";
import { FiCheck } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For side projects and getting started",
    cta: "Start free",
    href: "/auth/register",
    featured: false,
    features: [
      "10,000 clicks/mo",
      "Up to 50 short links",
      "Basic click analytics",
      "7-day analytics retention",
      "Standard clk.mp domain",
      "1 team member",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For growing teams and serious marketers",
    cta: "Start free trial",
    href: "/auth/register",
    featured: true,
    features: [
      "250,000 clicks/mo",
      "Unlimited short links",
      "Advanced analytics (device, OS, referrer, geo)",
      "1-year analytics retention",
      "Custom branded domains",
      "UTM builder & link tagging",
      "QR code generation",
      "5 team members",
      "API access + webhooks",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For platforms and high-volume operations",
    cta: "Contact sales",
    href: "/contact",
    featured: false,
    features: [
      "Unlimited clicks",
      "Unlimited links & domains",
      "Unlimited analytics retention",
      "SSO / SAML + role-based access",
      "Dedicated IP & SLA-backed uptime",
      "Audit logs & compliance exports",
      "Priority support + dedicated CSM",
      "Unlimited team members",
      "On-prem / VPC deployment option",
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-border/70 bg-secondary/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 rounded-full bg-secondary text-secondary-foreground"
          >
            <HiSparkles className="mr-1 h-3 w-3 text-primary" /> Simple pricing
          </Badge>
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Plans that scale with your links
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when your clicks do. No surprise overages.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex h-full flex-col overflow-visible border-border/70 transition-all",
                tier.featured
                  ? "border-primary shadow-lg shadow-primary/10 lg:-translate-y-2"
                  : "hover:border-primary/40 hover:shadow-md",
              )}
            >
              {tier.featured && (
                <div className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2">
                  <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground shadow-md">
                    Most popular
                  </Badge>
                </div>
              )}
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="font-display text-xl font-semibold">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>

                <Button
                  size="lg"
                  variant={tier.featured ? "default" : "outline"}
                  className="mt-6 w-full"
                >
                  <Link to={tier.href}>{tier.cta}</Link>
                </Button>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <FiCheck className="h-2.5 w-2.5" />
                      </span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need more clicks than Pro allows but not ready for Enterprise?{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Talk to us about a custom plan
          </a>
          .
        </p>
      </div>
    </section>
  );
}
