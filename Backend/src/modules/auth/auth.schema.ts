import { activeRefreshTokens, users } from "@/db/schema.ts";

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const registerUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    password: true,
    name: true,
    userName: true,
  })
  .openapi("RegisterUser");

export const loginUserSchema = createSelectSchema(users)
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

export type ActiveRefreshToken = typeof activeRefreshTokens.$inferInsert;
