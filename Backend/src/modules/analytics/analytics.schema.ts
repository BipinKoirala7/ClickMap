import { clickEvents } from "@/config/schema.ts";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const createClickEventSchema =
  createInsertSchema(clickEvents).openapi("CreateClickEvent");
export const selectClickEventSchema =
  createSelectSchema(clickEvents).openapi("SelectClickEvent");
export const updateClickEventSchema =
  createUpdateSchema(clickEvents).openapi("UpdateClickEvent");

export type CreateClickEventDto = typeof createClickEventSchema.type;
export type SelectClickEventDto = typeof selectClickEventSchema.type;
export type UpdateClickEventDto = typeof updateClickEventSchema.type;

export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
