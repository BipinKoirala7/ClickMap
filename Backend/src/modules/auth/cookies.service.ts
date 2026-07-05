import type { Request, Response } from "express";
import type { User } from "./auth.schema.ts";
import { jwtService } from "./jwt.service.ts";

function getAccessCookiesFromRequest(req: Request): string | null {
  return req.cookies["accessToken"] ?? null;
}

function getRefreshCookiesFromRequest(req: Request): string | null {
  return req.cookies["refreshToken"] ?? null;
}

async function setAccessCookiesInResponse(
  res: Response,
  user: User,
): Promise<void> {
  const accessToken = await jwtService.createAccessToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
}

async function setRefreshCookiesInResponse(
  res: Response,
  userId: string,
): Promise<void> {
  const refreshToken = await jwtService.createRefreshToken(userId);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });
}

function clearAccessTokenCookieInResponse(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
}

function clearRefreshTokenCookieInResponse(res: Response): void {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}

function clearCookiesInResponse(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}

export const cookiesService = {
  getAccessCookiesFromRequest,
  getRefreshCookiesFromRequest,
  setAccessCookiesInResponse,
  setRefreshCookiesInResponse,
  clearAccessTokenCookieInResponse,
  clearRefreshTokenCookieInResponse,
  clearCookiesInResponse,
};
