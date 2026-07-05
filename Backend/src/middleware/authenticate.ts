import { type Request, type Response, type NextFunction } from "express";

import { AuthenticationError, MissingTokenError } from "@/errors/Errors.ts";
import { cookiesService } from "@/modules/auth/cookies.service.ts";
import { jwtService } from "@/modules/auth/jwt.service.ts";
import { JWTExpired } from "jose/errors";
import { authService } from "@/modules/auth/auth.service.ts";

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
  try {
    req.userId = await jwtService.verifyAccessToken(accessToken);
    next();
  } catch (error) {
    console.error("Jwt Verification error");
    console.error(error);

    if (error instanceof JWTExpired) {
      const refreshToken = cookiesService.getRefreshCookiesFromRequest(req);

      if (!refreshToken) throw new AuthenticationError();
      const userId = await jwtService.verifyRefreshToken(refreshToken);
      await authService.setActiveRefreshToken({
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    throw new AuthenticationError();
  }
}

export async function refreshTokensInCookies() {}
