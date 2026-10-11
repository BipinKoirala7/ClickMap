import { configDotenv } from "dotenv";
import type { NewLink, UpdateLinkDto } from "@/modules/links/links.schema.ts";
import { db } from "@/db/database.ts";
import { links } from "@/db/schema.ts";
import { eq, and } from "drizzle-orm";

configDotenv();

async function createLink(link: NewLink) {
  return await db.insert(links).values(link);
}

async function getUserLinks(userId: string) {
  return await db.query.links.findMany({
    where: eq(links.userId, userId),
  });
}

async function getTotalUserLinks(userId: string) {
  return await db.query.links
    .findMany({
      where: eq(links.userId, userId),
    })
    .then((links) => links.length);
}

async function getLink(linkId: string, userId: string) {
  return await db.query.links.findFirst({
    where: and(eq(links.id, linkId), eq(links.userId, userId)),
  });
}

async function getLinkbyShortCode(shortCode: string) {
  return await db.query.links.findFirst({
    where: eq(links.shortCode, shortCode),
  });
}

async function getTotalClicksForUser(userId: string) {
  return await db.query.clickEvents
    .findMany({
      where: eq(links.userId, userId),
    })
    .then((clickEvents) => clickEvents.length);
}

async function getTotalActiveLinksForUser(userId: string) {
  return await db.query.links
    .findMany({
      where: and(eq(links.userId, userId), eq(links.isActive, true)),
    })
    .then((links) => links.length);
}

async function updateLink(
  linkId: string,
  userId: string,
  linkData: Partial<UpdateLinkDto>,
) {
  return await db
    .update(links)
    .set(linkData)
    .where(and(eq(links.id, linkId), eq(links.userId, userId)));
}

async function activateLink(linkId: string, userId: string) {
  return await db
    .update(links)
    .set({ isActive: true })
    .where(and(eq(links.id, linkId), eq(links.userId, userId)));
}

async function deactivateLink(linkId: string, userId: string) {
  return await db
    .update(links)
    .set({ isActive: false })
    .where(and(eq(links.id, linkId), eq(links.userId, userId)));
}

export const linkRepository = {
  createLink,
  getUserLinks,
  getTotalUserLinks,
  getTotalClicksForUser,
  getTotalActiveLinksForUser,
  getLink,
  getLinkbyShortCode,
  updateLink,
  activateLink,
  deactivateLink,
};
