import { clickEvents } from "@/db/schema.ts";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

export const createClickEventSchema =
  createInsertSchema(clickEvents).openapi("CreateClickEvent");
export const selectClickEventSchema =
  createSelectSchema(clickEvents).openapi("SelectClickEvent");
export const updateClickEventSchema =
  createUpdateSchema(clickEvents).openapi("UpdateClickEvent");

export type CreateClickEventDto = z.infer<typeof createClickEventSchema>;
export type SelectClickEventDto = z.infer<typeof selectClickEventSchema>;
export type UpdateClickEventDto = z.infer<typeof updateClickEventSchema>;

export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
