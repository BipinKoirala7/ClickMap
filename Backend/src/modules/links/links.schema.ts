import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { link } from "@/db/schema.ts";
import type z from "zod";

export const createLinkSchema = createInsertSchema(link).openapi("CreateLink");
export const publicLinkSchema = createSelectSchema(link)
  .omit({ userId: true })
  .openapi("SelectLink");
export const updateLinkSchema = createUpdateSchema(link).openapi("UpdateLink");

export type CreateLinkDto = z.infer<typeof createLinkSchema>;
export type PublicLinkDto = z.infer<typeof publicLinkSchema>;
export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;

export type Link = typeof link.$inferSelect;
export type NewLink = typeof link.$inferInsert;
