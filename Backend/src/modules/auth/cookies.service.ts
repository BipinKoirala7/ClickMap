import type { Request, Response } from "express";

const 

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
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
}

async function setRefreshCookiesInResponse(
  res: Response,
  refreshToken: string,
): Promise<void> {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth/refresh",
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
