import { db } from "@/db/database";
import { clickEvents } from "@/db/schema";

async function createEvent() {
  await db.insert(clickEvents).values();
}
