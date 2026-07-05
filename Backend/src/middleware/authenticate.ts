import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AuthenticationError, MissingTokenError } from "@/errors/Errors.ts";
import { cookiesService } from "@/modules/auth/cookies.service.ts";
import { config } from "@/config/index.ts";

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
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    next();
  } catch (error) {
    console.error("Jwt Verification error");
    console.error(error);
    throw new AuthenticationError();
  }
}
