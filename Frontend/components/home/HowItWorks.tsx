import StepItem from "@/components/home/StepItem";

const steps = [
  {
    number: "01",
    title: "Drop a URL",
    description:
      "Paste any link, optionally pick a custom alias or expiration date.",
  },
  {
    number: "02",
    title: "Share anywhere",
    description:
      "Use the short URL in emails, ads, QR codes, or SMS — it resolves instantly.",
  },
  {
    number: "03",
    title: "Map your clicks",
    description:
      "Watch live dashboards reveal who clicked, from where, and what they did next.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-10 sm:grid-cols-3">
        {steps.map((step) => (
          <StepItem key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
