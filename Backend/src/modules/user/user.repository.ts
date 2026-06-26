import { db } from "@/db/database.ts";
import { users } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import type { UpdateUserDto } from "./user.schema.ts";

export async function findById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function findBySupabaseId(supabaseId: string) {
  return await db.query.users.findFirst({
    where: eq(users.supabaseId, supabaseId),
  });
}

export async function updateUserBySupabaseId(
  supabaseId: string,
  { name, userName }: UpdateUserDto,
) {
  return await db
    .update(users)
    .set({ name, userName })
    .where(eq(users.supabaseId, supabaseId));
}

export async function updateUserStatus(supabaseId: string, isActive: boolean) {
  return await db
    .update(users)
    .set({ isActive: isActive })
    .where(eq(users.supabaseId, supabaseId));
}
