"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { clicksOverTime } from "@/lib/analytics-data";

const chartConfig = {
  clicks: { label: "clicks", color: "var(--chart-1)" },
  unique: { label: "unique", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ClicksChart() {
  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>Clicks over time</CardTitle>
        <CardDescription>
          Total clicks and unique visitors across all links
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart data={clicksOverTime} margin={{ left: 0, right: 12 }}>
            <defs>
              {(["clicks", "unique"] as const).map((key) => (
                <linearGradient
                  key={key}
                  id={`fill-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={1}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Area
              dataKey="clicks"
              type="natural"
              stroke="var(--color-clicks)"
              fill="url(#fill-clicks)"
              strokeWidth={2}
            />
            <Area
              dataKey="unique"
              type="natural"
              stroke="var(--color-unique)"
              fill="url(#fill-unique)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
