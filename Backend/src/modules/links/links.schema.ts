import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { link } from "@/db/schema.ts";
import type z from "zod";

export const createLinkSchema = createInsertSchema(link).openapi("CreateLink");
export const selectLinkSchema = createSelectSchema(link).openapi("SelectLink");
export const updateLinkSchema = createUpdateSchema(link).openapi("UpdateLink");

export type CreateLinkDto = z.infer<typeof createLinkSchema>;
export type SelectLinkDto = z.infer<typeof selectLinkSchema>;
export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;

export type Link = typeof link.$inferSelect;
export type NewLink = typeof link.$inferInsert;
