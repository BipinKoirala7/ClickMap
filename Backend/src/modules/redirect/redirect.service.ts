import { config } from "@/config/config";
import { logger } from "@/lib/logger";
import redisClient from "@/lib/redisConnect";
import { linkRepository } from "@/modules/links/links.repository";
import type { Link } from "../links/links.schema";

async function getLinkURLByShortCode(shortCode: string) {
  const cached = await readRedirectCache(shortCode);
  logger.info({ cached }, "Redis cached link");
  if (cached) return isRedirectable(cached) ? cached : null;

  const link = await linkRepository.getLinkbyShortCode(shortCode);
  if (!link || !isRedirectable(link)) return null;

  await createRedirectCache(link.shortCode, link);
  return link;
}

function getRedirectRedisKey(shortcode: string) {
  return `redirect:${shortcode}`;
}

async function createRedirectCache(shortCode: string, link: Link) {
  try {
    await redisClient.set(
      getRedirectRedisKey(shortCode),
      JSON.stringify(link),
      {
        expiration: { type: "EX", value: config.REDIS_TTL },
      },
    );
  } catch (err) {
    logger.warn({ err }, "Failed to create User Cache");
  }
}

async function readRedirectCache(shortCode: string): Promise<Link | null> {
  try {
    const cached = await redisClient.get(getRedirectRedisKey(shortCode));
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn({ err }, "Failed to get the cach user");
    return null;
  }
}

async function invalidateRedirectCache(shortCode: string) {
  try {
    await redisClient.del(getRedirectRedisKey(shortCode));
  } catch (err) {
    logger.warn({ err }, "Failed to invalidate user cache");
  }
}

// Helper functions
function isRedirectable(link: Link) {
  return link.isActive && new Date(link.expiresAt) > new Date();
}

export const redirectService = {
  getLinkURLByShortCode,
  createRedirectCache,
  invalidateRedirectCache,
};
