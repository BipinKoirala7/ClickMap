import { Sparkles } from "lucide-react";
import PricingCard from "./PricingCard";

const plans = [
  {
    name: "Free",
    description: "For side projects and getting started",
    price: "$0",
    period: "forever",
    cta: "Start free",
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
    description: "For growing teams and serious marketers",
    price: "$19",
    period: "/month",
    cta: "Start free trial",
    highlighted: true,
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
    description: "For platforms and high-volume operations",
    price: "Custom",
    cta: "Contact sales",
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

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Simple pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Plans that scale with your links
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when your clicks do. No surprise overages.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Need more clicks than Pro allows but not ready for Enterprise?{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Talk to us about a custom plan.
          </a>
        </p>
      </div>
    </section>
  );
}
