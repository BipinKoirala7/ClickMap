import { clickEvents } from "@/db/schema.ts";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

export const createClickEventSchema = createInsertSchema(clickEvents)
  .pick({
    linkId: true,
    clickedAt: true,
    referer: true,
    ip: true,
    country: true,
    city: true,
    userAgent: true,
    browser: true,
    browserVersion: true,
    os: true,
    device: true,
    isBot: true,
  })
  .openapi("CreateClickEvent");
export const selectClickEventSchema =
  createSelectSchema(clickEvents).openapi("SelectClickEvent");

export type CreateClickEventInput = z.input<typeof createClickEventSchema>;
export type CreateClickEventDto = z.infer<typeof createClickEventSchema>;
export type SelectClickEventDto = z.infer<typeof selectClickEventSchema>;

export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
