import { db } from "@/db/database.ts";
import { users } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import type { UpdateUserDto } from "./user.schema.ts";

async function findById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
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
  findById,
  updateUserById,
  updateUserStatus,
};
