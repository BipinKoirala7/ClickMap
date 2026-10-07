import { linkRepository } from "@/modules/links/links.repository";

async function getLinkURLByShortUrl(shortCode: string) {
  const link = await linkRepository.getLinkbyShortCode(shortCode);
  if (!link || !link.isActive) return null;
  if (new Date() > link.expiresAt) return null;

  return link;
}

export const redirectService = {
  getLinkURLByShortUrl,
};
