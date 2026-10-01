import { cookies } from "next/headers";
import api from "@/lib/axios";
import { GetUserResponse } from "@/types";
import { cache } from "react";
import config from "@/lib/config";
import axios from "axios";

export const getUser = cache(async () => {
  const cookieStore = await cookies();
  if (!cookieStore.has(config.ACCESS_TOKEN_COOKIE_PLACEHOLDER)) return null;

  try {
    const response = await api.get<GetUserResponse>("/user/me", {
      headers: { Cookie: cookieStore.toString() },
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401)
      return null;
    else throw error;
  }
});
