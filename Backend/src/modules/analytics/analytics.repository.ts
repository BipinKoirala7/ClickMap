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

const analyticsRepository = {
  createEvent,
  getEventsByLinkId,
};

export default analyticsRepository;
