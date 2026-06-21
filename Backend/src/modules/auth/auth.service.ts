import {
  findBySupabaseId,
  updateUserStatus,
} from "@/modules/user/user.repository.ts";

import { UserNotFound } from "@/errors/Errors.ts";

export async function setActiveStatus(supabaseId: string, isActive: boolean) {
  const user = await findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFound("User not found");
  return updateUserStatus(user.id, isActive);
}
