import { AuthenticationError, UserNotFoundError } from "@/errors/Errors.ts";
import { findBySupabaseId, updateUser } from "./user.repository.ts";
import {
  publicUserSchema,
  updateUserSchema,
  type PublicUserDto,
  type UpdateUserDto,
} from "./user.schema.ts";

export async function getUserBySupabaseId(
  supabaseId: string,
): Promise<PublicUserDto> {
  const user = await findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return publicUserSchema.parse(user);
}

export async function updateuser(
  supabaseId: string,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!supabaseId) throw new AuthenticationError();
  const info = updateUserSchema.parse(updatedUserInfo);
  await updateUser(supabaseId, info);
}
