import api from "@/lib/axios";
import { CreateLinkDto, GetUserLinksResponse } from "@/types";
import { toast } from "sonner";

export async function getUserLinks() {
  const response = await api.get<GetUserLinksResponse>("/link");

  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch user links");
  }
}

export async function createLink(createLinkDto: CreateLinkDto) {
  const response = await api.post("/link", createLinkDto);

  if (response.status === 200) {
    toast.success("Link created successfully!");
  } else {
    toast.error(response.data.message || "Failed to create link");
  }
}

export async function deactivateLink(linkId: string) {
  const response = await api.patch(`/link/${linkId}/deactivate`);

  if (response.status === 200) {
    toast.success("Link deactivated successfully!");
  } else {
    toast.error(response.data.message || "Failed to deactivate link");
  }
}

export async function activateLink(linkId: string) {
  const response = await api.patch(`/link/${linkId}/activate`);

  if (response.status === 200) {
    toast.success("Link activated successfully!");
  } else {
    toast.error(response.data.message || "Failed to activate link");
  }
}
