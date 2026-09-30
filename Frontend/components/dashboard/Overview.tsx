import MainStats from "@/components/dashboard/MainStats";
import Chart from "@/components/dashboard/Chart";

export default function Overview() {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          Last 30 days across all your links.
        </p>
      </div>
      <MainStats />
      <Chart />
    </div>
  );
}
