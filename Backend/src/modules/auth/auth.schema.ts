import { activeRefreshTokens, users } from "@/db/schema.ts";

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const registerUserSchema = createInsertSchema(users, {
  email: (schema) =>
    schema.check(z.email("Email is invalid")).openapi("Email").trim(),
  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be less than 255 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  name: z
    .string("Name must be a string")
    .nonempty("Name must be at least 1 character long")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  userName: z
    .string("Username must be a string")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores")
    .nonempty("Username must be at least 1 character long")
    .max(100, "Username must be less than 100 characters")
    .trim(),
})
  .pick({
    email: true,
    password: true,
    name: true,
    userName: true,
  })
  .openapi("RegisterUser");

export const loginUserSchema = createSelectSchema(users, {
  email: (schema) => schema.check(z.email("Email is invalid").trim()),
  password: z
    .string("Password must be a string")
    .nonempty("Password must be at least 1 character long"),
})
  .pick({
    email: true,
    password: true,
  })
  .openapi("LoginUser");

export const activeRefreshTokenSchema = createSelectSchema(
  activeRefreshTokens,
  {
    userId: z
      .string("User ID must be a string")
      .nonempty("User ID must be at least 1 character long"),
    refreshToken: z
      .string("Refresh token must be a string")
      .nonempty("Refresh token must be at least 1 character long"),
    expiresAt: z
      .date("Expires at must be a date")
      .refine((date) => date > new Date(), {
        message: "expiresAt must be in the future",
      }),
  },
)
  .pick({
    userId: true,
    refreshToken: true,
    expiresAt: true,
  })
  .openapi("ActiveRefreshToken");

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type ActiveRefreshTokenDto = z.infer<typeof activeRefreshTokenSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type NewActiveRefreshToken = typeof activeRefreshTokens.$inferInsert;
export type ActiveRefreshToken = typeof activeRefreshTokens.$inferSelect;
