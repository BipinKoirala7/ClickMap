"use client";

import Chart from "@/components/dashboard/Chart";
import MainStats from "@/components/dashboard/MainStats";
import RecentLinks from "@/components/dashboard/RecentLinks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

function DashboardOverview() {
  const [length, setLength] = useState("30");
  const items = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "180", label: "Last 180 days" },
    { value: "365", label: "Last 365 days" },
  ];
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground">
            Last {length} days across all your links.
          </p>
        </div>
        <Select
          items={items}
          value={length}
          onValueChange={(value) => setLength(value ? value : "30")}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Days</SelectLabel>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <MainStats length={length} />
      <Chart length={length} />
      <RecentLinks />
    </div>
  );
}

export default DashboardOverview;
