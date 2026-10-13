"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { devices } from "@/lib/analytics-data";

const chartConfig = {
  sessions: { label: "Sessions" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function DevicesChart() {
  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Sessions by device type</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="device" />}
            />
            <Pie
              data={devices}
              dataKey="sessions"
              nameKey="device"
              innerRadius={65}
              outerRadius={100}
              strokeWidth={3}
            />
            <ChartLegend content={<ChartLegendContent nameKey="device" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
