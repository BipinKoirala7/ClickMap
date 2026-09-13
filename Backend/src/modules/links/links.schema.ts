import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { links } from "@/db/schema.ts";
import z from "zod";

export const createLinkSchema = createInsertSchema(links, {
  shortCode: (schema) =>
    schema
      .trim()
      .check(z.minLength(1, "Short code must be at least 1 character long")),
  originalUrl: (schema) =>
    schema
      .trim()
      .check(
        z
          .url("Original URL must be a valid URL")
          .min(1, "Original URL must be at least 1 character long"),
      ),
  isActive: (schema) => schema.optional(),
  expiresAt: (schema) =>
    schema
      .optional()
      .refine(
        (date) => date == null || date.getTime() > Date.now(),
        "expiresAt must be in the future",
      ),
})
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .openapi("CreateLink");

export const publicLinkSchema = createSelectSchema(links)
  .omit({ userId: true })
  .openapi("SelectLink");

export const updateLinkSchema = createUpdateSchema(links, {
  originalUrl: (schema) =>
    schema
      .trim()
      .check(
        z
          .url("Original URL must be a valid URL")
          .min(1, "Original URL must be at least 1 character long"),
      ),
  shortCode: (schema) => schema.trim().min(1).nonempty(),
  title: (schema) => schema.trim(),
  expiresAt: (schema) =>
    schema
      .optional()
      .refine(
        (date) => date == null || date.getTime() > Date.now(),
        "expiresAt must be in the future",
      ),
})
  .pick({ shortCode: true, originalUrl: true, title: true, expiresAt: true })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  })
  .openapi("UpdateLink");

export type CreateLinkDto = z.infer<typeof createLinkSchema>;
export type PublicLinkDto = z.infer<typeof publicLinkSchema>;
export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
