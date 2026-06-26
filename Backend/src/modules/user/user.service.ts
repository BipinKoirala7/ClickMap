import { AuthenticationError, UserNotFoundError } from "@/errors/Errors.ts";
import { findBySupabaseId, updateUserBySupabaseId } from "./user.repository.ts";
import {
  publicUserSchema,
  updateUserSchema,
  type PublicUserDto,
  type UpdateUserDto,
} from "./user.schema.ts";

async function getUserBySupabaseId(supabaseId: string): Promise<PublicUserDto> {
  const user = await findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return publicUserSchema.parse(user);
}

async function updateUser(
  supabaseId: string,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!supabaseId) throw new AuthenticationError();

  const existingUser = await findBySupabaseId(supabaseId);
  if (!existingUser) throw new UserNotFoundError();

  const info = updateUserSchema.parse(updatedUserInfo);
  await updateUserBySupabaseId(supabaseId, info);
}

async function getUserIdBySupabaseId(supabaseId: string): Promise<string> {
  const user = await findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return user.id;
}
export const userService = {
  getUserBySupabaseId,
  updateUser,
  getUserIdBySupabaseId,
};
