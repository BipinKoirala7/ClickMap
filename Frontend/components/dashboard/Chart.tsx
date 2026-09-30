"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Chart() {
  const chartData = [
    { date: "Jun 1", clicks: 480, visitors: 300 },
    { date: "Jun 3", clicks: 560, visitors: 340 },
    { date: "Jun 5", clicks: 650, visitors: 320 },
    { date: "Jun 7", clicks: 700, visitors: 420 },
    { date: "Jun 9", clicks: 560, visitors: 390 },
    { date: "Jun 11", clicks: 460, visitors: 330 },
    { date: "Jun 13", clicks: 400, visitors: 300 },
    { date: "Jun 15", clicks: 420, visitors: 260 },
    { date: "Jun 17", clicks: 380, visitors: 240 },
    { date: "Jun 19", clicks: 400, visitors: 220 },
    { date: "Jun 21", clicks: 560, visitors: 260 },
    { date: "Jun 24", clicks: 700, visitors: 300 },
    { date: "Jun 27", clicks: 760, visitors: 340 },
    { date: "Jun 30", clicks: 680, visitors: 380 },
  ];

  return (
    <div className="w-full rounded-2xl bg-muted/40 p-6 flex flex-col gap-6">
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
            data={chartData}
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
              dataKey="clicks"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#clicksGradient)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="var(--chart-4)"
              strokeWidth={2}
              fill="url(#visitorsGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Chart;
