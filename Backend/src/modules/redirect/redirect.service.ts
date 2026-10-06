import { linkRepository } from "../links/links.repository";

async function getLinkURLByShortUrl(shortUrl: string) {
  const link = await linkRepository.getLinkbyShortURL(shortUrl, "");
  if (!link) return null;
  return link.originalUrl;
}

export const redirectService = {
  getLinkURLByShortUrl,
};
