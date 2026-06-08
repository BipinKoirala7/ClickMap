import * as z from "zod";

const linkSchema = z.object({
  id: z.nanoid(),
  shortCode: z.string().max(10),
  originalUrl: z.url(),
  userId: z.nanoid(),
  title: z.string().min(2).max(50),
  isCustomCode: z.boolean(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createLinkSchema = z.object({
  shortCode: z.string().max(10),
  originalUrl: z.url(),
  userId: z.nanoid(),
  title: z.string().min(2).max(50),
  isCustomCode: z.boolean(),
  expiresAt: z.date().nullable(),
});

export const updateLinkSchema = createLinkSchema; // We need to understand first how we want to update the link

export type link = z.infer<typeof linkSchema>;
