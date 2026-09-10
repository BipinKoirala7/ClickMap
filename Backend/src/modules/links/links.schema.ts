import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { links } from "@/db/schema.ts";
import z from "zod";

export const createLinkSchema = createInsertSchema(links, {
  shortCode: (_schema) => z.string().min(1).nonempty(),
  originalUrl: (_schema) => z.url().nonempty(),
  isActive: (_schema) => z.boolean().optional(),
  expiresAt: (_schema) => z.coerce.date().optional(),
})
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => {
      if (data.expiresAt != null) {
        return data.expiresAt.getTime() > Date.now();
      }
      return true;
    },
    {
      message: "expiresAt must be in the future",
      path: ["expiresAt"],
    },
  )
  .openapi("CreateLink");

export const publicLinkSchema = createSelectSchema(links)
  .omit({ userId: true })
  .openapi("SelectLink");

export const updateLinkSchema = createUpdateSchema(links, {
  originalUrl: (_schema) => z.url().nonempty(),
  shortCode: (_schema) => z.string().min(1).nonempty(),
  title: (_schema) => z.string(),
  expiresAt: (_schema) => z.coerce.date(),
})
  .pick({ shortCode: true, originalUrl: true, title: true, expiresAt: true })
  .refine(
    (data) => {
      if (data.expiresAt != null) {
        return data.expiresAt.getTime() > Date.now();
      }
      return true;
    },
    {
      message: "expiresAt must be in the future",
      path: ["expiresAt"],
    },
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  })
  .openapi("UpdateLink");

export type CreateLinkDto = z.infer<typeof createLinkSchema>;
export type PublicLinkDto = z.infer<typeof publicLinkSchema>;
export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
