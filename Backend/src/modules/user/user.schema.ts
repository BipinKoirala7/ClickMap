import { createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { users } from "@/db/schema.ts";
import z from "zod";

export const publicUserSchema = createSelectSchema(users)
  .omit({
    password: true,
  })
  .openapi("User");

export const updateUserSchema = createUpdateSchema(users)
  .pick({
    name: true,
    userName: true,
  })
  .openapi("UpdateUser");

export type PublicUserDto = z.infer<typeof publicUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export type User = typeof users.$inferSelect;
