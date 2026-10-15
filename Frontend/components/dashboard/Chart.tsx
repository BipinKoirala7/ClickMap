"use client";

import { getClicksOverTime } from "@/api/analytics/overviewAnalytics";
import { ClicksOverTime } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Chart({ length }: { length: string }) {
  const { isLoading, isError, data } = useQuery<ClicksOverTime>({
    queryKey: ["clicks-over-time", length],
    queryFn: () => getClicksOverTime(parseInt(length)),
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-1/3 rounded bg-muted"></div>
          <div className="h-3 w-1/4 rounded bg-muted"></div>
        </div>
        <div className="h-80 w-full rounded bg-muted"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">Error</h2>
          <p className="text-sm text-muted-foreground">
            Failed to fetch chart data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-muted/40 p-6 border-2 border-muted flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          Clicks over time
        </h2>
        <p className="text-xs text-muted-foreground">
          Daily total clicks and unique visitors
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              interval="equidistantPreserveStart"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              width={"auto"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}
            />
            <Area
              type="monotone"
              name="Clicks"
              dataKey="clickCount"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#clicksGradient)"
            />
            <Area
              type="monotone"
              name="Unique Visitors"
              dataKey="visitorCount"
              stroke="var(--chart-4)"
              strokeWidth={2}
              fill="url(#visitorsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Chart;
