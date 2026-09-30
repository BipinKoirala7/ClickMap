import { Link2, Zap, Activity, TrendingUp } from "lucide-react";

function MainStats() {
  const stats = [
    {
      label: "Total Links",
      value: "1,284",
      change: "+12.4% vs last month",
      icon: Link2,
    },
    {
      label: "Total Clicks",
      value: "248,910",
      change: "+8.1% vs last month",
      icon: Zap,
    },
    {
      label: "Active Links",
      value: "1,128",
      change: "+3.2% vs last month",
      icon: Activity,
    },
    {
      label: "Click Rate",
      value: "62.4%",
      change: "+1.8% vs last month",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, change, icon: Icon }) => (
        <div key={label} className="rounded-2xl bg-muted/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon size={16} className="text-primary" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-foreground">{value}</div>
          <div className="mt-1 text-sm text-primary">{change}</div>
        </div>
      ))}
    </div>
  );
}

export default MainStats;
