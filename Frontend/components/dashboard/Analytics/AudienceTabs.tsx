import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevicesChart } from "@/components/dashboard/Analytics/DevicesChart";
import { BrowsersChart } from "@/components/dashboard/Analytics/BrowserChart";
import { RankedList } from "@/components/dashboard/Analytics/RankedList";
import { ReferrersTable } from "@/components/dashboard/Analytics/ReferrersTable";
import { TopLinksTable } from "@/components/dashboard/Analytics/TopLinksTable";
import { topCountries } from "@/lib/analytics-data";

export function AudienceTabs() {
  return (
    <Tabs defaultValue="audience" className="gap-4">
      <TabsList>
        <TabsTrigger value="audience">Audience</TabsTrigger>
        <TabsTrigger value="referrers">Referrers</TabsTrigger>
        <TabsTrigger value="links">Top links</TabsTrigger>
      </TabsList>

      <TabsContent value="audience" className="grid gap-4 lg:grid-cols-3">
        <DevicesChart />
        <BrowsersChart />
        <RankedList
          title="Top countries"
          description="Clicks by location"
          items={topCountries}
        />
      </TabsContent>

      <TabsContent value="referrers">
        <ReferrersTable />
      </TabsContent>

      <TabsContent value="links">
        <TopLinksTable />
      </TabsContent>
    </Tabs>
  );
}
