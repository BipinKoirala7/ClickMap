import { BarChart3, Globe, ShieldCheck, Zap } from "lucide-react";
import FeatureCard from "@/components/home/FeaturedCard";

const features = [
  {
    icon: BarChart3,
    title: "Click analytics",
    description:
      "Time-series, referrers, device, OS, and browser splits — updated in real time.",
  },
  {
    icon: Globe,
    title: "Geo intelligence",
    description:
      "Map clicks down to country and city. Identify your audience clusters at a glance.",
  },
  {
    icon: Zap,
    title: "BullMQ-fast",
    description:
      "Every redirect resolves in <30ms backed by Redis and a job-queue pipeline.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "JWT auth, signed webhooks, OpenAPI-spec'd endpoints. Made for serious teams.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship smarter links
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete toolkit for marketers, devs, and product teams.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
