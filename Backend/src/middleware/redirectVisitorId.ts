import { logger } from "@/lib/logger";
import { cookiesService } from "@/modules/auth/cookies.service";
import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

export async function visitorIdInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let visitorId = cookiesService.getVisitorIdCookieFromRequest(req);
  logger.info({ visitorId }, "Visitor ID from cookie");

  if (!visitorId || visitorId.trim() === "") {
    const newVisitorId = nanoid();
    await cookiesService.setVisitorIdCookieInResponse(res, newVisitorId);
    visitorId = newVisitorId;
  }
  req.visitorId = visitorId;
  next();
}
