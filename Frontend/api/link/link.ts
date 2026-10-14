import api from "@/lib/axios";
import {
  ClicksOverTime,
  ClicksOverTimeResponse,
  GetLinksResponse,
  OverviewStatsResponse,
} from "@/types";

export async function getRecentLinks() {
  const response = await api.get<GetLinksResponse>("/overview/recent-links");

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch recent links");
  }
}

export async function getOverviewStats() {
  const response = await api.get<OverviewStatsResponse>(
    "/analytics/overview/stats",
  );

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(
      response.data.message || "Failed to fetch overview analytics",
    );
  }
}

export async function getClicksOverTime() {
  const response = await api.get<ClicksOverTimeResponse>(
    "/analytics/overview/clicks-over-time",
  );

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(
      response.data.message || "Failed to fetch clicks over time data",
    );
  }
}
