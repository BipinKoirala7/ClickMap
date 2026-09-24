import { activeRefreshTokens, users } from "@/db/schema.ts";

import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const registerUserSchema = createInsertSchema(users, {
  name: (schema) =>
    schema
      .trim()
      .check(z.minLength(5, "Name must be at least 5 characters long"))
      .openapi("Name"),
  userName: (schema) =>
    schema
      .trim()
      .check(z.minLength(3, "Username must be at least 3 character long"))
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .openapi("Username"),
  email: (schema) =>
    schema
      .trim()
      .toLowerCase()
      .check(z.email("Email is invalid"))
      .openapi("Email"),
  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be less than 255 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9\s]/, "Must contain a special character"),
})
  .pick({
    email: true,
    password: true,
    name: true,
    userName: true,
  })
  .openapi("RegisterUser");

export const loginUserSchema = z
  .object({
    email: z
      .string("Email must be a string")
      .trim()
      .toLowerCase()
      .check(z.email("Email is invalid")),
    password: z
      .string("Password must be a string")
      .nonempty("Password is required"),
  })
  .openapi("LoginUser");

export const activeRefreshTokenSchema = createInsertSchema(
  activeRefreshTokens,
  {
    userId: (schema) =>
      schema
        .trim()
        .check(z.minLength(1, "User ID must be at least 1 character long"))
        .openapi("User ID"),
    refreshToken: (schema) =>
      schema
        .trim()
        .check(
          z.minLength(1, "Refresh token must be at least 1 character long"),
        )
        .openapi("Refresh Token"),
    expiresAt: (schema) =>
      schema
        .refine(
          (date) => date > new Date(),
          "Refresh token must be in the future",
        )
        .openapi("Expires At"),
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
