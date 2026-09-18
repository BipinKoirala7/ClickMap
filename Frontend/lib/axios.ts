import axios, { AxiosError } from "axios";
import config from "@/lib/config";
import { toast } from "sonner";

const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  timeout: config.API_TIMEOUT,
});

// We can add request interceptors to modify requests before they are sent
// We have to refresh cookie when we get 401 status from response.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // const _originalRequest = error.config as InternalAxiosRequestConfig & {
    //   _retry?: boolean;
    // };

    // network error / no response
    if (!error.response) {
      console.log("Network error:", error.message);

      toast.error(
        "Network error. Please check your internet connection and try again.",
      );

      return Promise.reject(error);
    }

    console.log("Error", error);
    toast.error(
      error.response?.data?.message || "An error occurred. Please try again.",
    );

    return Promise.reject(error);
  },
);

export default api;
