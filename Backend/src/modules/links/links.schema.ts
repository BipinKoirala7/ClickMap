import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { links } from "@/db/schema.ts";
import type z from "zod";

export const createLinkSchema = createInsertSchema(links)
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => data.expiresAt === undefined || data.expiresAt > new Date(),
    {
      message: "expiresAt must be in the future",
      path: ["expiresAt"],
    },
  )
  .openapi("CreateLink");
export const publicLinkSchema = createSelectSchema(links)
  .omit({ userId: true })
  .openapi("SelectLink");
export const updateLinkSchema = createUpdateSchema(links)
  .pick({ shortCode: true, originalUrl: true, title: true, isCustomCode: true })
  .partial()
  .openapi("UpdateLink");

export type CreateLinkDto = z.infer<typeof createLinkSchema>;
export type PublicLinkDto = z.infer<typeof publicLinkSchema>;
export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
