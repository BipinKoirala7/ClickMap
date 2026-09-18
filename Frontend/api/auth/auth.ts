import api from "@/lib/axios";
import { RegisterUserDto, RegisterUserResponse } from "@/types";

export async function register(userData: RegisterUserDto) {
  const response = await api.post<RegisterUserResponse>(
    "/auth/register",
    userData,
  );

  if (response.status === 201) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to register user");
  }
}
