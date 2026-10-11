import {
  AuthenticationError,
  InvalidLinkError,
  LinkAlreadyActiveError,
  LinkAlreadyDeactivatedError,
  LinkNotFoundError,
} from "@/errors/Errors.ts";
import {
  createLinkSchema,
  publicLinkSchema,
  updateLinkSchema,
  type CreateLinkInput,
  type NewLink,
  type PublicLinkDto,
  type UpdateLinkInput,
} from "@/modules/links/links.schema.ts";
import { linkRepository } from "@/modules/links/links.repository.ts";
import { userService } from "@/modules/user/user.service.ts";
import { logger } from "@/lib/logger.ts";
import redisClient from "@/lib/redisConnect";
import { redirectService } from "../redirect/redirect.service";

async function createLink(userId: string | undefined, dto: CreateLinkInput) {
  if (!userId || userId.trim().length == 0) {
    throw new AuthenticationError();
  }

  const user = await userService.getActiveUser(userId);
  const link = createLinkSchema.safeParse(dto);

  if (!link.success) {
    logger.error("Invalid link data provided");
    logger.error(link.error.message);
    throw new InvalidLinkError();
  }

  const newLink: NewLink = {
    userId: user.id,
    ...link.data,
  };
  await linkRepository.createLink(newLink);
}

async function getUserLinks(userId: string | undefined) {
  if (!userId || userId.trim().length == 0) throw new AuthenticationError();

  const user = await userService.getActiveUser(userId);
  const links = await linkRepository.getUserLinks(user.id);
  const publicLinks: PublicLinkDto[] = [];

  for (const link of links) {
    publicLinks.push(publicLinkSchema.parse(link));
  }

  return publicLinks;
}

async function getUserTotalLinks(userId: string) {
  return await linkRepository.getTotalUserLinks(userId);
}

async function getTotalClicksForUser(userId: string) {
  return await linkRepository.getTotalClicksForUser(userId);
}

async function getTotalActiveLinksForUser(userId: string) {
  return await linkRepository.getTotalActiveLinksForUser(userId);
}

async function getClickRateForUser(userId: string) {
  const totalLinks = await getUserTotalLinks(userId);
  const totalClicks = await getTotalClicksForUser(userId);

  if (totalLinks === 0) {
    return 0;
  }

  return totalClicks / totalLinks;
}

async function getLinkInfo(
  linkId: string | undefined,
  userId: string | undefined,
) {
  if (!userId || userId.trim().length == 0) throw new AuthenticationError();
  if (!linkId || linkId.trim().length == 0)
    throw new LinkNotFoundError("Link ID is required");

  const user = await userService.getActiveUser(userId);
  const cached = await readLinkCache(user.id, linkId);
  if (cached) return cached;

  const link = await linkRepository.getLink(linkId, user.id);
  if (!link) throw new LinkNotFoundError();

  const publicLink = publicLinkSchema.parse(link);
  await createLinkCache(user.id, linkId, publicLink);
  return publicLink;
}

async function updateLink(
  linkId: string | undefined,
  userId: string | undefined,
  linkData: UpdateLinkInput,
) {
  if (!userId || userId.trim().length == 0) throw new AuthenticationError();
  if (!linkId || linkId.trim().length == 0) throw new LinkNotFoundError();

  const user = await userService.getActiveUser(userId);
  const data = updateLinkSchema.parse(linkData);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();

  await linkRepository.updateLink(linkId, user.id, data);
  await invalidateLinkCache(user.id, linkId);
  await redirectService.invalidateRedirectCache(link.shortCode);
}

async function activateLink(
  linkId: string | undefined,
  userId: string | undefined,
) {
  if (!userId || userId.trim().length == 0) throw new AuthenticationError();
  if (!linkId || linkId.trim().length == 0) throw new LinkNotFoundError();

  const user = await userService.getActiveUser(userId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  if (link.isActive) throw new LinkAlreadyActiveError();

  await linkRepository.activateLink(linkId, user.id);
  await invalidateLinkCache(user.id, linkId);
  await redirectService.createRedirectCache(link.shortCode, link);
}

async function deactivateLink(
  linkId: string | undefined,
  userId: string | undefined,
) {
  if (!userId || userId.trim().length == 0) throw new AuthenticationError();
  if (!linkId || linkId.trim().length == 0) throw new LinkNotFoundError();

  const user = await userService.getActiveUser(userId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  if (!link.isActive)
    throw new LinkAlreadyDeactivatedError("Link is already deactivated");

  await linkRepository.deactivateLink(linkId, user.id);
  await invalidateLinkCache(user.id, linkId);
  await redirectService.invalidateRedirectCache(link.shortCode);
}

// Helper Functions
function getLinkRedisKey(userId: string, linkId: string) {
  return `link:${userId}:${linkId}`;
}

async function createLinkCache(
  userId: string,
  linkId: string,
  link: PublicLinkDto,
) {
  try {
    await redisClient.set(
      getLinkRedisKey(userId, linkId),
      JSON.stringify(link),
    );
  } catch (err) {
    logger.warn({ err }, "Failed to create a link cache");
  }
}

async function readLinkCache(
  userId: string,
  linkId: string,
): Promise<PublicLinkDto | null> {
  try {
    const cached = await redisClient.get(getLinkRedisKey(userId, linkId));
    return cached ? publicLinkSchema.parse(JSON.parse(cached)) : null;
  } catch (err) {
    logger.warn({ err }, "Failed to read link cache");
    return null;
  }
}

async function invalidateLinkCache(userId: string, linkId: string) {
  try {
    await redisClient.del(getLinkRedisKey(userId, linkId));
  } catch (err) {
    logger.warn({ err }, "Failed to invalidate a link cache");
  }
}

export const linkService = {
  createLink,
  getUserLinks,
  getUserTotalLinks,
  getTotalClicksForUser,
  getTotalActiveLinksForUser,
  getClickRateForUser,
  getLinkInfo,
  updateLink,
  activateLink,
  deactivateLink,
};
