"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { browsers } from "@/lib/analytics-data";

const chartConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BrowsersChart() {
  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>Browsers</CardTitle>
        <CardDescription>Most used browsers</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            data={browsers}
            layout="vertical"
            margin={{ left: 0, right: 12 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
