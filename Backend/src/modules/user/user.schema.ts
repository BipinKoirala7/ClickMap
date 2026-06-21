import { createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { users } from "@/db/schema.ts";

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

export type UpdateUserDto = typeof updateUserSchema.type;

export type User = typeof users.$inferSelect;
