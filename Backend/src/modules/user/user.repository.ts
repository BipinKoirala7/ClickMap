import { db } from "@/db/database.ts";
import { users } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import type { UpdateUserDto } from "./user.schema.ts";
import type { NewUser } from "../auth/auth.schema.ts";

async function createUser(user: NewUser) {
  return await db.insert(users).values(user);
}

async function findById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

async function findByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

async function updateUserById(id: string, { name, userName }: UpdateUserDto) {
  return await db.update(users).set({ name, userName }).where(eq(users.id, id));
}

async function updateUserStatus(id: string, isActive: boolean) {
  return await db
    .update(users)
    .set({ isActive: isActive })
    .where(eq(users.id, id));
}

export const userRepository = {
  createUser,
  findById,
  findByEmail,
  updateUserById,
  updateUserStatus,
};
