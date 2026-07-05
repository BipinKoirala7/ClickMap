import { userRepository } from "@/modules/user/user.repository.ts";

import {
  UserAlreadyDeactivatedError,
  UserAlreadyActiveError,
  AuthenticationError,
} from "@/errors/Errors.ts";
import { userService } from "@/modules/user/user.service.ts";
import {
  activeRefreshTokenSchema,
  loginUserSchema,
  registerUserSchema,
  type ActiveRefreshTokenDto,
  type NewUser,
  type User,
} from "@/modules/auth/auth.schema.ts";
import type { Request, Response } from "express";
import { cookiesService } from "./cookies.service.ts";
import { authRepository } from "./auth.repository.ts";
import { jwtService } from "./jwt.service.ts";

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
  const refreshToken = await jwtService.createRefreshToken(user.id);
  const accessToken = await jwtService.createAccessToken(user);
  await cookiesService.setRefreshCookiesInResponse(res, refreshToken);
  await cookiesService.setAccessCookiesInResponse(res, accessToken);

  await setActiveRefreshToken({
    userId: user.id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = cookiesService.getRefreshCookiesFromRequest(req);
  if (!refreshToken)
    throw new AuthenticationError("Refresh token is missing in the request");

  const userId = await jwtService.verifyRefreshToken(refreshToken);

  const activeRefreshToken = await authRepository.getActiveRefreshToken(
    userId,
    refreshToken,
  );
  if (!activeRefreshToken) {
    throw new AuthenticationError("Refresh token is not active");
  }

  const user = await userService.getById(userId);
  const newAccessToken = await jwtService.createAccessToken(user);
  await cookiesService.setAccessCookiesInResponse(res, newAccessToken);
}

async function logout(res: Response) {
  cookiesService.clearCookiesInResponse(res);
}

async function activateUserStatus(id: string | undefined) {
  if (id == undefined) throw new AuthenticationError("User ID is undefined");

  const user = await userService.getById(id);
  if (user.isActive) throw new UserAlreadyActiveError("User is already active");

  return userRepository.updateUserStatus(id, true);
}

async function deactivateUserStatus(id: string | undefined) {
  if (id == undefined) throw new AuthenticationError("User ID is undefined");

  const user = await userService.getById(id);
  if (!user.isActive)
    throw new UserAlreadyDeactivatedError("User is already deactivated");

  return userRepository.updateUserStatus(id, false);
}

async function setActiveRefreshToken(refreshTokenInfo: ActiveRefreshTokenDto) {
  const info = activeRefreshTokenSchema.parse(refreshTokenInfo);
  await authRepository.setActiveRefreshToken(info);
}

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
  activateUserStatus,
  deactivateUserStatus,
  setActiveRefreshToken,
};
