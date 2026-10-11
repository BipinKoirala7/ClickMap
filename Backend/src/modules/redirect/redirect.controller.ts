import type { Request, Response } from "express";
import { redirectService } from "@/modules/redirect/redirect.service";
import type { CreateClickEventInput } from "../analytics/analytics.schema";
import { isbot } from "isbot";
import { UAParser } from "ua-parser-js";
import { lookupGeo } from "@/lib/geo";
import { logger } from "@/lib/logger";
import { clicksQueue } from "@/lib/queue";

async function getLinkURLByShortCode(
  req: Request<{ shortCode: string }>,
  res: Response,
) {
  const { shortCode } = req.params;
  const link = await redirectService.getLinkURLByShortCode(shortCode);

  logger.info("Fetched Link");
  logger.info(link);

  if (link) {
    const ua = req.headers["user-agent"] ?? null;
    const parsed = ua ? new UAParser(ua).getResult() : null;
    const { country, city } = lookupGeo(req.ip);

    const event: CreateClickEventInput = {
      linkId: link.id,
      visitorId: req.visitorId,
      clickedAt: new Date().toISOString(),
      referer: req.headers["referer"] ?? null,
      ip: req.ip ?? null,
      userAgent: ua,
      browser: parsed?.browser.name ?? null,
      browserVersion: parsed?.browser.version ?? null,
      os: parsed?.os.name ?? null,
      device: parsed?.device.type ?? null,
      isBot: ua ? isbot(ua) : false,
      country,
      city,
    };

    clicksQueue.add("clicks", event);

    res.redirect(link.originalUrl);
  } else {
    res
      .status(404)
      .send("Something went wrong. Please check the URL and try again.");
  }
}

export const redirectController = {
  getLinkURLByShortCode,
};
