"use client";

import { Line, LineChart } from "recharts";

export function TrendSparkLine({ seed }: { seed: number }) {
  const data = Array.from({ length: 14 }, (_, i) => ({
    value: 50 + 6 * Math.sin(i / 1.6 + seed) - i * 0.9,
  }));

  return (
    <LineChart width={112} height={28} data={data}>
      <Line
        dataKey="value"
        type="natural"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
}
