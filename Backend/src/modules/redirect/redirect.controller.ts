import type { Request, Response } from "express";
import { redirectService } from "@/modules/redirect/redirect.service";

async function getLinkURLByShortUrl(
  req: Request<{ shortUrl: string }>,
  res: Response,
) {
  const { shortUrl } = req.params;
  const longUrl = await redirectService.getLinkURLByShortUrl(shortUrl);

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res
      .status(404)
      .send("Something went wrong. Please check the URL and try again.");
  }
}

export const redirectController = {
  getLinkURLByShortUrl,
};
