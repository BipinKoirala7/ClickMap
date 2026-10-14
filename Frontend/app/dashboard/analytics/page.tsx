import { AnalyticsHeader } from "@/components/dashboard/Analytics/AnalyticsHeader";
import { StatCards } from "@/components/dashboard/Analytics/StatCards";
import { ClicksChart } from "@/components/dashboard/Analytics/ClicksChart";
import { AudienceTabs } from "@/components/dashboard/Analytics/AudienceTabs";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <StatCards />
      <ClicksChart />
      <AudienceTabs />
    </div>
  );
}
