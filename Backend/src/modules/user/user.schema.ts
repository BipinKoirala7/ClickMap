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
  name: (_schema) => z.string().min(1).nonempty(),
  email: (_schema) => z.email("Email is invalid").nonempty("Email is required"),
  userName: (_schema) =>
    z
      .string("Username must be a string")
      .min(1, "Username must be at least 1 character long")
      .nonempty("Username must be at least 1 character long"),
})
  .pick({
    name: true,
    userName: true,
  })
  .openapi("UpdateUser");

export type PublicUserDto = z.infer<typeof publicUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
