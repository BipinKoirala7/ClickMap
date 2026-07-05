import { userRepository } from "@/modules/user/user.repository.ts";

import {
  UserAlreadyDeactivatedError,
  UserAlreadyActiveError,
  AuthenticationError,
} from "@/errors/Errors.ts";
import { userService } from "@/modules/user/user.service.ts";
import {
  loginUserSchema,
  registerUserSchema,
  type NewUser,
  type User,
} from "@/modules/auth/auth.schema.ts";
import type { Response } from "express";
import { cookiesService } from "./cookies.service.ts";

async function registerUser(userData: any) {
  const user = registerUserSchema.parse(userData);
  const newUser: NewUser = {
    name: user.name,
    userName: user.userName,
    email: user.email,
    password: user.password,
  };

  return userRepository.createUser(newUser);
}

async function loginUser(loginData: any, res: Response) {
  const loginInfo = loginUserSchema.parse(loginData);
  const user: User = await userService.getByEmail(loginInfo.email);
  await cookiesService.setRefreshCookiesInResponse(res, user.id);
  await cookiesService.setAccessCookiesInResponse(res, user);
}

async function setActiveRefreshToken(refreshToken: string, userId: string) {}

async function logout(res: Response) {
  cookiesService.clearCookiesInResponse(res);
}

async function activateUserStatus(id: string | undefined) {
  if (id == undefined) throw new AuthenticationError("User ID is undefined");

  const user = await userService.getById(id);
  if (user.isActive) throw new UserAlreadyActiveError();

  return userRepository.updateUserStatus(id, true);
}

async function deactivateUserStatus(id: string | undefined) {
  if (id == undefined) throw new AuthenticationError("User ID is undefined");

  const user = await userService.getById(id);
  if (!user.isActive) throw new UserAlreadyDeactivatedError();

  return userRepository.updateUserStatus(id, false);
}

export const authService = {
  registerUser,
  loginUser,
  logout,
  activateUserStatus,
  deactivateUserStatus,
};
