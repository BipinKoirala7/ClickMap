import { userRepository } from "@/modules/user/user.repository.ts";

import {
  UserAlreadyDeactivatedError,
  UserAlreadyActiveError,
  AuthenticationError,
  UserNotFoundError,
} from "@/errors/Errors.ts";
import { userService } from "@/modules/user/user.service.ts";
import {
  activeRefreshTokenSchema,
  loginUserSchema,
  registerUserSchema,
  type ActiveRefreshTokenDto,
  type NewActiveRefreshToken,
  type User,
} from "@/modules/auth/auth.schema.ts";
import type { Request, Response } from "express";
import { cookiesService } from "./cookies.service.ts";
import { authRepository } from "./auth.repository.ts";
import { jwtService } from "./jwt.service.ts";
import { logger } from "@/lib/logger.ts";
import { config } from "@/config/index.ts";
import { password } from "@/lib/password.ts";

async function registerUser(userData: any) {
  const user = registerUserSchema.parse(userData);

  logger.info({ userName: user.userName }, "Registering new user");

  user.password = await password.hashPassword(user.password);

  const createdUserId = await userRepository.createUser(user);

  logger.info({ userId: createdUserId }, "User registered successfully");
}

async function loginUser(loginData: any, res: Response) {
  const loginInfo = loginUserSchema.parse(loginData);

  logger.debug("Login attempt");

  let user: User;

  try {
    user = await userService.getByEmail(loginInfo.email);
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      throw new AuthenticationError("Invalid email or password");
    }

    throw new Error("Something went wrong");
  }

  const isPasswordValid = await password.verifyPassword(
    loginInfo.password,
    user.password,
  );

  if (!isPasswordValid) {
    logger.warn({ userId: user.id }, "Invalid password attempt");
    throw new AuthenticationError("Invalid email or password");
  }

  if (!user.isActive) {
    logger.warn({ userId: user.id }, "Attempted login for inactive user");
    throw new AuthenticationError("User account is deactivated");
  }

  const refreshToken = await jwtService.createRefreshToken(user.id);
  const accessToken = await jwtService.createAccessToken(user);
  await setActiveRefreshToken({
    userId: user.id,
    refreshToken,
    expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_EXPIRATION),
  });
  await cookiesService.setRefreshCookiesInResponse(res, refreshToken);
  await cookiesService.setAccessCookiesInResponse(res, accessToken);

  logger.info({ userId: user.id }, "User logged in successfully");
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = cookiesService.getRefreshCookiesFromRequest(req);

  if (!refreshToken) {
    logger.warn("Refresh token missing in request");
    throw new AuthenticationError("Refresh token is missing in the request");
  }

  const userId = await jwtService.verifyRefreshToken(refreshToken);
  const activeRefreshToken = await authRepository.getActiveRefreshToken(
    refreshToken,
    userId,
  );

  if (!activeRefreshToken) {
    logger.warn({ userId }, "Refresh token is not active");
    throw new AuthenticationError("Refresh token is not active");
  }

  const user = await userService.getById(userId);
  const newRefreshToken = await jwtService.createRefreshToken(user.id);
  const newAccessToken = await jwtService.createAccessToken(user);

  await authRepository.setActiveRefreshToken({
    userId: user.id,
    refreshToken: newRefreshToken,
    expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_EXPIRATION),
  });
  await cookiesService.setRefreshCookiesInResponse(res, newRefreshToken);
  await cookiesService.setAccessCookiesInResponse(res, newAccessToken);

  logger.debug({ userId }, "Access token refreshed");
}

async function logout(res: Response) {
  cookiesService.clearCookiesInResponse(res);
  logger.debug("User logged out, cookies cleared");
}

async function activateUserStatus(id: string | undefined) {
  if (id == undefined) {
    logger.warn("activateUserStatus called with undefined ID");
    throw new AuthenticationError("User ID is undefined");
  }

  const user = await userService.getById(id);
  if (user.isActive) {
    logger.warn({ userId: id }, "Attempted to activate an already active user");
    throw new UserAlreadyActiveError("User is already active");
  }

  const result = await userRepository.updateUserStatus(id, true);
  logger.info({ userId: id }, "User activated");
  return result;
}

async function deactivateUserStatus(id: string | undefined) {
  if (id == undefined) {
    logger.warn("deactivateUserStatus called with undefined ID");
    throw new AuthenticationError("User ID is undefined");
  }

  const user = await userService.getById(id);
  if (!user.isActive) {
    logger.warn(
      { userId: id },
      "Attempted to deactivate an already deactivated user",
    );
    throw new UserAlreadyDeactivatedError("User is already deactivated");
  }

  const result = await userRepository.updateUserStatus(id, false);
  logger.info({ userId: id }, "User deactivated");
  return result;
}

// Helper Functions
async function setActiveRefreshToken(refreshTokenInfo: ActiveRefreshTokenDto) {
  const info = activeRefreshTokenSchema.parse(refreshTokenInfo);
  await authRepository.setActiveRefreshToken(info);
  logger.debug({ userId: info.userId }, "Active refresh token stored");
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
