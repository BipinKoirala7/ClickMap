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
    schema.trim().min(5, "Name must be at least 5 characters long"),
  email: (schema) =>
    schema.trim().toLowerCase().check(z.email("Email is invalid")),
  userName: (schema) =>
    schema
      .trim()
      .check(z.minLength(1, "Username must be at least 1 character long"))
      .openapi("Username")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
})
  .pick({
    name: true,
    userName: true,
    email: true,
  })
  .openapi("UpdateUser")
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type PublicUserDto = z.infer<typeof publicUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
