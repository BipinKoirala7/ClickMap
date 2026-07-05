import type { Request } from "express";

function getAccessCookiesFromRequest(req: Request): string | null {
  return req.cookies["accessToken"] ?? null;
}

function getRefreshCookiesFromRequest(req: Request): string | null {
  return req.cookies["refreshToken"] ?? null;
}

export const cookiesService = {
  getAccessCookiesFromRequest,
  getRefreshCookiesFromRequest,
};
