"use client";

import { getOverviewStats } from "@/api/link/link";
import { OverviewStats } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link2, Zap, Activity, TrendingUp } from "lucide-react";

function MainStats() {
  const { isLoading, isError, data } = useQuery<OverviewStats>({
    queryKey: ["overview-stats"],
    queryFn: getOverviewStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-2 border-muted p-5 rounded-2xl bg-muted/40 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Loading...</span>
              <div className="rounded-lg bg-primary/10 p-2">
                <Link2 size={16} className="text-primary" />
              </div>
            </div>
            <div className="mt-3 h-8 w-24 rounded bg-muted"></div>
            <div className="mt-1 h-4 w-32 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500">
        Failed to load analytics data. Please try again later.
      </div>
    );
  }

  console.log("Overview Analytics Data:", data);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        key={"Total Links"}
        className="border-2 border-muted p-5 rounded-2xl bg-muted/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{"Total Links"}</span>
          <div className="rounded-lg bg-primary/10 p-2">
            <Link2 size={16} className="text-primary" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-foreground">
          {data.total_links}
        </div>
        <div className="mt-1 text-sm text-primary">
          {data.prev_total_links === 0
            ? "No Activity for Previous Period"
            : `${
                Math.abs(
                  (data.total_links - data.prev_total_links) /
                    data.prev_total_links,
                ) * 100
              }% vs prev 30 days`}
        </div>
      </div>
      <div
        key={"Total Clicks"}
        className="border-2 border-muted p-5 rounded-2xl bg-muted/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {"Total Clicks"}
          </span>
          <div className="rounded-lg bg-primary/10 p-2">
            <Zap size={16} className="text-primary" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-foreground">
          {data.total_clicks}
        </div>
        <div className="mt-1 text-sm text-primary">
          {data.prev_total_clicks === 0
            ? "No Activity for Previous Period"
            : `${
                Math.abs(
                  (data.total_clicks - data.prev_total_clicks) /
                    data.prev_total_clicks,
                ) * 100
              }% vs prev 30 days`}
        </div>
      </div>
      <div
        key={"Active Links"}
        className="border-2 border-muted p-5 rounded-2xl bg-muted/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {"Active Links"}
          </span>
          <div className="rounded-lg bg-primary/10 p-2">
            <Activity size={16} className="text-primary" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-foreground">
          {data.total_active_links}
        </div>
        <div className="mt-1 text-sm text-primary">
          {data.prev_total_active_links === 0
            ? "No Activity for Previous Period"
            : `${
                Math.abs(
                  (data.total_active_links - data.prev_total_active_links) /
                    data.prev_total_active_links,
                ) * 100
              }% vs prev 30 days`}
        </div>
      </div>
      <div
        key={"Click Rate"}
        className="border-2 border-muted p-5 rounded-2xl bg-muted/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{"Click Rate"}</span>
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp size={16} className="text-primary" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold text-foreground">
          {data.click_rate}
        </div>
        <div className="mt-1 text-sm text-primary">
          {data.prev_click_rate === 0
            ? "No Activity for Previous Period"
            : `${
                Math.abs(
                  (data.click_rate - data.prev_click_rate) /
                    data.prev_click_rate,
                ) * 100
              }% vs prev 30 days`}
        </div>
      </div>
    </div>
  );
}

export default MainStats;
