import api from "@/lib/axios";
import { GetLinksResponse } from "@/types";

export async function getRecentLinks() {
  const response = await api.get<GetLinksResponse>("/link");

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch recent links");
  }
}
