import { cookies } from "next/headers";
import api from "@/lib/axios";
import { GetUserResponse } from "@/types";
import { cache } from "react";
import config from "@/lib/config";
import axios from "axios";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/lib";

export const getUser = cache(async () => {
  const cookieStore = await cookies();
  if (!cookieStore.has(config.ACCESS_TOKEN_COOKIE_PLACEHOLDER)) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  try {
    const response = await api.get<GetUserResponse>("/user/me", {
      headers: { Cookie: cookieStore.toString() },
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect(ROUTES.AUTH.LOGIN);
    } else throw error;
  }
});
