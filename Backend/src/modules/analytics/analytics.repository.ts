import { db } from "@/db/database";
import { clickEvents } from "@/db/schema";
import type { CreateClickEventDto } from "./analytics.schema";
import { eq } from "drizzle-orm";

async function createEvent(event: CreateClickEventDto): Promise<void> {
  await db.insert(clickEvents).values(event);
}

async function getEventsByLinkId(linkId: string) {
  return await db
    .select()
    .from(clickEvents)
    .where(eq(clickEvents.linkId, linkId));
}

async function getTotalClicksForUser(userId: string) {
  return await db.query.clickEvents
    .findMany({
      where: eq(links.userId, userId),
    })
    .then((clickEvents) => clickEvents.length);
}

const analyticsRepository = {
  createEvent,
  getEventsByLinkId,
};

export default analyticsRepository;
