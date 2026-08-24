import { db } from "@/db/database.ts";
import { users } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import type { UpdateUserDto } from "./user.schema.ts";
import type { NewUser } from "../auth/auth.schema.ts";
import AppError from "@/errors/AppError.ts";

async function createUser(user: NewUser) {
  const [inserted] = await db
    .insert(users)
    .values(user)
    .returning({ id: users.id });

  if (!inserted) {
    throw new AppError("Insert failed: no row returned", 500);
  }

  return inserted.id;
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
