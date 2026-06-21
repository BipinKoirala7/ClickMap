import { type Request, type Response, type NextFunction } from "express";
import { jwtVerify } from "jose";
import { PROJECT_JWKS } from "@/config/supabaseJwks.ts";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, PROJECT_JWKS);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}
