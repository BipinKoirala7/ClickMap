import axios from "axios";
import config from "@/lib/config";

const instance = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  timeout: config.API_TIMEOUT,
});

// We can add request interceptors to modify requests before they are sent

instance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error: Error) => {
    console.log("Error", error);
    return Promise.reject(error);
  },
);

export default instance;
