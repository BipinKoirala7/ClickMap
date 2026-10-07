import { linkRepository } from "@/modules/links/links.repository";

async function getLinkURLByShortUrl(shortUrl: string) {
  const link = await linkRepository.getLinkbyShortURL(shortUrl);
  if (!link || !link.isActive) return null;
  if (new Date() > link.expiresAt) return null;

  return link;
}

export const redirectService = {
  getLinkURLByShortUrl,
};
