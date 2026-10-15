import { configDotenv } from "dotenv";
import type {
  LinkWithClickCountAndUniqueClicks,
  NewLink,
  UpdateLinkDto,
} from "@/modules/links/links.schema.ts";
import { db } from "@/db/database.ts";
import { clickEvents, links } from "@/db/schema.ts";
import { eq, and, count, lt, gte, desc, countDistinct, sql } from "drizzle-orm";

configDotenv();

async function createLink(link: NewLink) {
  return await db.insert(links).values(link);
}

async function getUserLinks(userId: string) {
  return await db
    .select({
      id: links.id,
      shortCode: links.shortCode,
      originalUrl: links.originalUrl,
      title: links.title,
      isActive: links.isActive,
      clicks: count(clickEvents.id),
      uniqueClicks: countDistinct(clickEvents.visitorId),
      expiresAt: links.expiresAt,
      createdAt: links.createdAt,
      updatedAt: links.updatedAt,
    })
    .from(links)
    .leftJoin(clickEvents, eq(clickEvents.linkId, links.id))
    .where(eq(links.userId, userId))
    .groupBy(links.id);
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
  const day = sql<string>`to_char(${clickEvents.clickedAt}, 'YYYY-MM-DD')`.as(
    "day",
  );

  const rows = await db
    .select({
      date: day,
      count: count(),
      visitorCount: countDistinct(clickEvents.visitorId),
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
    .groupBy(day)
    .orderBy(day);

  const byDay = new Map(rows.map((r) => [r.date, r]));

  const result: { date: string; clickCount: number; visitorCount: number }[] =
    [];
  for (let t = startDate.getTime(); t < endDate.getTime(); t += 86_400_000) {
    const key = new Date(t).toISOString().slice(0, 10); // UTC YYYY-MM-DD
    result.push({
      date: new Date(key).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clickCount: byDay.get(key)?.count ?? 0,
      visitorCount: byDay.get(key)?.visitorCount ?? 0,
    });
  }
  return result;
}

async function getUserRecentLinks(
  userId: string,
): Promise<LinkWithClickCountAndUniqueClicks[]> {
  return await db
    .select({
      id: links.id,
      title: links.title,
      shortCode: links.shortCode,
      originalUrl: links.originalUrl,
      clicks: count(links.id),
      uniqueClicks: countDistinct(clickEvents.visitorId),
      isActive: links.isActive,
      expiresAt: links.expiresAt,
      createdAt: links.createdAt,
      updatedAt: links.updatedAt,
    })
    .from(links)
    .innerJoin(clickEvents, eq(clickEvents.linkId, links.id))
    .where(eq(links.userId, userId))
    .groupBy(links.id)
    .orderBy(desc(links.createdAt))
    .limit(5);
}

async function getTopReferrerForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      referrer: clickEvents.referer,
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
    .groupBy(clickEvents.referer)
    .orderBy(desc(count()));

  return rows.length > 0 ? rows[0] : { referrer: "Unknown", count: 0 };
}

async function getTopReferrersForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      referrer: clickEvents.referer,
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
    .groupBy(clickEvents.referer)
    .orderBy(desc(count()));

  return rows;
}

async function getTopLocationForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      country: clickEvents.country,
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
    .groupBy(clickEvents.country)
    .orderBy(desc(count()));

  return rows.length > 0 ? rows[0] : { country: "Unknown", count: 0 };
}

async function getTotalUniqueVisitorsForUser(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const [result] = await db
    .select({ count: countDistinct(clickEvents.visitorId) })
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

async function getDeviceTypeDistributionForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      deviceType: clickEvents.device,
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
    .groupBy(clickEvents.device)
    .orderBy(desc(count()));

  return rows;
}

async function getBrowserDistributionForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      browser: clickEvents.browser,
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
    .groupBy(clickEvents.browser)
    .orderBy(desc(count()));

  return rows;
}

async function getCountryDistributionForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      country: clickEvents.country,
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
    .groupBy(clickEvents.country)
    .orderBy(desc(count()));

  return rows;
}

async function getUsersTopLinks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      linkId: links.id,
      shortCode: links.shortCode,
      isActive: links.isActive,
      clicks: count(clickEvents.linkId),
      uniqueClicks: countDistinct(clickEvents.visitorId),
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
    .groupBy(links.id)
    .orderBy(desc(count(clickEvents.linkId)))
    .limit(10);

  return rows;
}

async function getTotalClickInLink(
  userId: string,
  linkId: string,
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
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    );

  return result ? result.count : 0;
}

async function getTotalUniqueVisitorsInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const [result] = await db
    .select({ count: countDistinct(clickEvents.visitorId) })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    );

  return result ? result.count : 0;
}

async function getTopReferrerInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      referrer: clickEvents.referer,
      count: count(),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(clickEvents.referer)
    .orderBy(desc(count()));

  return rows.length > 0 ? rows[0] : { referrer: "Unknown", count: 0 };
}

async function getTopLocationInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      country: clickEvents.country,
      count: count(),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(clickEvents.country)
    .orderBy(desc(count()));

  return rows.length > 0 ? rows[0] : { country: "Unknown", count: 0 };
}

async function getClicksOverTimeInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const day = sql<string>`to_char(${clickEvents.clickedAt}, 'YYYY-MM-DD')`.as(
    "day",
  );

  const rows = await db
    .select({
      date: day,
      count: count(),
      visitorCount: countDistinct(clickEvents.visitorId),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(day)
    .orderBy(day);

  const byDay = new Map(rows.map((r) => [r.date, r]));

  const result: { date: string; count: number; visitorCount: number }[] = [];
  for (let t = startDate.getTime(); t < endDate.getTime(); t += 86_400_000) {
    const key = new Date(t).toISOString().slice(0, 10); // UTC YYYY-MM-DD
    result.push({
      date: key,
      count: byDay.get(key)?.count ?? 0,
      visitorCount: byDay.get(key)?.visitorCount ?? 0,
    });
  }
  return result;
}

async function getDeviceTypeDistributionInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      deviceType: clickEvents.device,
      count: count(),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(clickEvents.device)
    .orderBy(desc(count()));

  return rows;
}

async function getTopLocationsInLink(
  userId: string,
  linkId: string,
  startDate: Date,
  endDate: Date,
) {
  const rows = await db
    .select({
      country: clickEvents.country,
      count: count(),
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        eq(links.id, linkId),
        gte(clickEvents.clickedAt, startDate),
        lt(clickEvents.clickedAt, endDate),
      ),
    )
    .groupBy(clickEvents.country)
    .orderBy(desc(count()));

  return rows;
}

async function getRecentClickEvents(userId: string, limit = 10) {
  return await db
    .select({
      id: clickEvents.id,
      linkId: clickEvents.linkId,
      visitorId: clickEvents.visitorId,
      device: clickEvents.device,
      browser: clickEvents.browser,
      country: clickEvents.country,
      referer: clickEvents.referer,
      clickedAt: clickEvents.clickedAt,
    })
    .from(clickEvents)
    .innerJoin(links, eq(clickEvents.linkId, links.id))
    .where(eq(links.userId, userId))
    .orderBy(desc(clickEvents.clickedAt))
    .limit(limit);
}

export const linkRepository = {
  createLink,
  getUserLinks,
  getLink,
  getLinkbyShortCode,
  updateLink,
  activateLink,
  deactivateLink,
  getTotalUserLinks,
  getTotalClicksForUser,
  getTotalActiveLinksForUser,
  getClicksOverTime,
  getUserRecentLinks,
  getTopReferrerForClicks,
  getTopReferrersForClicks,
  getTopLocationForClicks,
  getTotalUniqueVisitorsForUser,
  getDeviceTypeDistributionForClicks,
  getBrowserDistributionForClicks,
  getCountryDistributionForClicks,
  getUsersTopLinks,

  getTotalClickInLink,
  getTotalUniqueVisitorsInLink,
  getTopReferrerInLink,
  getTopLocationInLink,
  getClicksOverTimeInLink,
  getDeviceTypeDistributionInLink,
  getTopLocationsInLink,
  getRecentClickEvents,
};
