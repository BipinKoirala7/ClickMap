import { type Request, type Response, type NextFunction } from "express";
import { jwtVerify } from "jose";
import { PROJECT_JWKS } from "@/config/supabaseJwks.ts";
import { AuthenticationError, MissingTokenError } from "@/errors/Errors.ts";

export async function authenticate(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log("Tokens are missing in the request");
    throw new MissingTokenError();
  }

  try {
    const { payload } = await jwtVerify(token, PROJECT_JWKS);
    req.user = payload;
    next();
  } catch {
    console.log("User is not logged in or authenticated");
    throw new AuthenticationError();
  }
}
