import { type Request, type Response, type NextFunction } from "express";

import { MissingTokenError } from "@/errors/Errors.ts";
import { cookiesService } from "@/modules/auth/cookies.service.ts";
import { jwtService } from "@/modules/auth/jwt.service.ts";

export async function authenticate(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  const accessToken = cookiesService.getAccessCookiesFromRequest(req);
  if (!accessToken) {
    console.error("Tokens are missing in the request");
    throw new MissingTokenError();
  }
  req.userId = await jwtService.verifyAccessToken(accessToken);
  next();
}

export async function authenticateRefreshToken(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  const refreshToken = cookiesService.getRefreshCookiesFromRequest(req);
  if (!refreshToken) {
    throw new MissingTokenError();
  }
  req.userId = await jwtService.verifyRefreshToken(refreshToken);
  next();
}
