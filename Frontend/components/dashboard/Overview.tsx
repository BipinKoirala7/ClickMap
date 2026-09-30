import MainStats from "@/components/dashboard/MainStats";
import Chart from "@/components/dashboard/Chart";

export default function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Overview</h1>
      <p className="mt-1 text-muted-foreground">
        Last 30 days across all your links.
      </p>
      <MainStats />
      <Chart />
    </div>
  );
}
