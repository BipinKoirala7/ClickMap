import { configDotenv } from "dotenv";
import type { NewLink, UpdateLinkDto } from "./links.schema.ts";
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

async function getLink(linkId: string, userId: string) {
  return await db.query.links.findFirst({
    where: and(eq(links.id, linkId), eq(links.userId, userId)),
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

export const linkRepository = {
  createLink,
  getUserLinks,
  getLink,
  updateLink,
  activateLink,
  deactivateLink,
};
