import { createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { users } from "@/db/schema.ts";
import z from "zod";

export const publicUserSchema = createSelectSchema(users)
  .omit({
    id: true,
    password: true,
  })
  .openapi("User");

export const updateUserSchema = createUpdateSchema(users, {
  name: (schema) =>
    schema
      .trim()
      .min(5, "Name must be at least 5 characters long")
      .max(100, "Name must be at most 100 characters long"),
  email: (schema) =>
    schema.trim().toLowerCase().check(z.email("Email is invalid")),
  userName: (schema) =>
    schema
      .trim()
      .check(z.minLength(1, "Username must be at least 1 character long"))
      .openapi("Username")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores")
      .max(100, "Username must be less than 100 characters"),
})
  .pick({
    name: true,
    userName: true,
  })
  .openapi("UpdateUser");

export type PublicUserDto = z.infer<typeof publicUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
