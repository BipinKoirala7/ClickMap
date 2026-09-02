import { activeRefreshTokens, users } from "@/db/schema.ts";

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const registerUserSchema = createInsertSchema(users, {
  email: z.email("Email is invalid"),
  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
})
  .pick({
    email: true,
    password: true,
    name: true,
    userName: true,
  })
  .openapi("RegisterUser");

export const loginUserSchema = createSelectSchema(users, {
  email: z.email("Email is invalid"),
  password: z
    .string("Password must be a string")
    .min(1, "Password must be at least 8 characters long"),
})
  .pick({
    email: true,
    password: true,
  })
  .openapi("LoginUser");

export const activeRefreshTokenSchema = createSelectSchema(activeRefreshTokens)
  .pick({
    userId: true,
    refreshToken: true,
    expiresAt: true,
  })
  .refine((data) => data.expiresAt > new Date(), {
    error: "expiredAt must be in future",
    path: ["expiresAt"],
  })
  .openapi("ActiveRefreshToken");

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type ActiveRefreshTokenDto = z.infer<typeof activeRefreshTokenSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type NewActiveRefreshToken = typeof activeRefreshTokens.$inferInsert;
export type ActiveRefreshToken = typeof activeRefreshTokens.$inferSelect;
