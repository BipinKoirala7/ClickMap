"use client";

import { Link2, Zap, Activity, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

export default function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Overview</h1>
      <p className="mt-1 text-muted-foreground">
        Last 30 days across all your links.
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-muted/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon size={16} className="text-primary" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">
              {value}
            </div>
            <div className="mt-1 text-sm text-primary">{change}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 rounded-2xl bg-muted/40 p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Clicks over time
        </h2>
        <p className="text-sm text-muted-foreground">
          Daily total clicks and unique visitors
        </p>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
                <linearGradient
                  id="visitorsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="var(--chart-4)"
                strokeWidth={2}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
