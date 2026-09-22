import api from "@/lib/axios";
import {
  LoginUserDto,
  LoginUserResponse,
  RegisterUserDto,
  RegisterUserResponse,
} from "@/types";

export async function register(userRegisterDetails: RegisterUserDto) {
  const response = await api.post<RegisterUserResponse>(
    "/auth/register",
    userRegisterDetails,
  );

  if (response.status === 201) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to register user");
  }
}

export async function login(userLoginDetails: LoginUserDto) {
  const response = await api.post<LoginUserResponse>(
    "/auth/login",
    userLoginDetails,
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to register user");
  }
}
