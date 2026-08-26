import type { Request, Response } from "express";
import { config } from "@/config/index.ts";

function getAccessCookiesFromRequest(req: Request): string | null {
  return req.cookies["accessToken"] ?? null;
}

function getRefreshCookiesFromRequest(req: Request): string | null {
  return req.cookies["refreshToken"] ?? null;
}

async function setAccessCookiesInResponse(
  res: Response,
  accessToken: string,
): Promise<void> {
  res.cookie("accessToken", accessToken, {
    httpOnly: config.COOKIE_HTTP_ONLY,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    maxAge: config.ACCESS_TOKEN_EXPIRATION,
    path: config.COOKIE_ACCESS_TOKEN_PATH,
  });
}

async function setRefreshCookiesInResponse(
  res: Response,
  refreshToken: string,
): Promise<void> {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: config.COOKIE_HTTP_ONLY,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    maxAge: config.REFRESH_TOKEN_EXPIRATION,
    path: config.COOKIE_REFRESH_TOKEN_PATH,
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
