import api from "@/lib/axios";
import { GetUserLinksResponse } from "@/types";
import { toast } from "sonner";

export async function getUserLinks() {
  const response = await api.get<GetUserLinksResponse>("/link");

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch user links");
  }
}

export async function createLink() {
  const response = await api.post("/link", {});

  if (response.status === 200) {
    toast.success("Link created successfully!");
  } else {
    toast.error(response.data.message || "Failed to create link");
  }
}
