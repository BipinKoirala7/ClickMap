import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { link } from "@/db/schema.ts";

export const createLinkSchema = createInsertSchema(link).openapi("CreateLink");
export const selectLinkSchema = createSelectSchema(link).openapi("SelectLink");
export const updateLinkSchema = createUpdateSchema(link).openapi("UpdateLink");

export type CreateLinkDto = typeof createLinkSchema.type;
export type SelectLinkDto = typeof selectLinkSchema.type;
export type UpdateLinkDto = typeof updateLinkSchema.type;

export type Link = typeof link.$inferSelect;
export type NewLink = typeof link.$inferInsert;
