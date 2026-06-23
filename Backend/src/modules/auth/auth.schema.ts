import { users } from "@/db/schema.ts";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Remove them as Supabase handles it
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

// export type RegisterUserDto = typeof registerUserSchema.type;
// export type LoginUserDto = typeof loginUserSchema.type;

export type NewUser = typeof users.$inferInsert;
