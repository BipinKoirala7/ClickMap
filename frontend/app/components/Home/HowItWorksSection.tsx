const steps = [
  {
    n: "01",
    title: "Drop a URL",
    body: "Paste any link, optionally pick a custom alias or expiration date.",
  },
  {
    n: "02",
    title: "Share anywhere",
    body: "Use the short URL in emails, ads, QR codes, or SMS — it resolves anywhere instantly.",
  },
  {
    n: "03",
    title: "Map your clicks",
    body: "Watch live dashboards reveal who clicked, from where, and what they did next.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-display text-5xl font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
