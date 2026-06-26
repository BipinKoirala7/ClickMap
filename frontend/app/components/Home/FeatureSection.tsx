import { FiBarChart2, FiGlobe, FiZap, FiShield } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FiBarChart2,
    title: "Click analytics",
    body: "Time-series, referrers, device, OS, and browser splits — updated in real time.",
  },
  {
    icon: FiGlobe,
    title: "Geo intelligence",
    body: "Map clicks down to country and city. Identify your audience clusters at a glance.",
  },
  {
    icon: FiZap,
    title: "BullMQ-fast",
    body: "Every redirect resolves in <30ms backed by Redis and a job-queue pipeline.",
  },
  {
    icon: FiShield,
    title: "Secure by default",
    body: "JWT auth, signed webhooks, OpenAPI-spec'd endpoints. Made for serious teams.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-border/70 bg-secondary/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Everything you need to ship smarter links
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete toolkit for marketers, devs, and product teams.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-border/70 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
