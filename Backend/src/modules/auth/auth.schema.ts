import { users } from "@/db/schema.ts";

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

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
