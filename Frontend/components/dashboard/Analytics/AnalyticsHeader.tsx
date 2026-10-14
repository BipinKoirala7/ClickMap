"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ranges = ["Last 7 days", "Last 30 days", "Last 90 days"];

export function AnalyticsHeader() {
  const [range, setRange] = useState(ranges[1]);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Cross-link performance and audience insights.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={range} onValueChange={(v) => v && setRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="size-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
