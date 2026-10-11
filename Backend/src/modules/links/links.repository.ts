import { configDotenv } from "dotenv";
import type { NewLink, UpdateLinkDto } from "@/modules/links/links.schema.ts";
import { db } from "@/db/database.ts";
import { clickEvents, links } from "@/db/schema.ts";
import { eq, and, count, lt, gte, desc } from "drizzle-orm";

configDotenv();

async function createLink(link: NewLink) {
  return await db.insert(links).values(link);
}

async function getUserLinks(userId: string) {
  return await db.query.links.findMany({
    where: eq(links.userId, userId),
  });
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

async function getTotalUserLinks(userId: string, date: Date) {
  const [result] = await db
    .select({ count: count() })
    .from(links)
    .where(and(eq(links.userId, userId), lt(links.createdAt, date)));

  return result ? result.count : 0;
}

// Helper functions
async function getTotalClicksForUser(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const [result] = await db
    .select({ count: count() })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    );

  return result ? result.count : 0;
}

async function getTotalActiveLinksForUser(userId: string, date: Date) {
  const [result] = await db
    .select({ count: count() })
    .from(links)
    .where(
      and(
        eq(links.userId, userId),
        eq(links.isActive, true),
        lt(links.createdAt, date),
      ),
    );

  return result ? result.count : 0;
}

async function getClicksOverTime(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const clicks = await db
    .select({
      date: clickEvents.clickedAt,
      count: count(),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(clickEvents.clickedAt)
    .orderBy(clickEvents.clickedAt);

  return clicks;
}

async function getUserRecentLinks(userId: string) {
  return await db
    .select({
      id: links.id,
      shortCode: links.shortCode,
      original: links.originalUrl,
      clicks: count(links.id),
      status: links.isActive,
      createdAt: links.createdAt,
    })
    .from(links)
    .innerJoin(clickEvents, eq(clickEvents.linkId, links.id))
    .where(eq(links.userId, userId))
    .groupBy(links.id)
    .orderBy(desc(links.createdAt))
    .limit(5);
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
  getClicksOverTime,
  getUserRecentLinks,
};
