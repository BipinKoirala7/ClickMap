import { AuthenticationError, UserNotFoundError } from "@/errors/Errors.ts";
import { userRepository } from "./user.repository.ts";
import {
  publicUserSchema,
  updateUserSchema,
  type PublicUserDto,
  type UpdateUserDto,
  type User,
} from "./user.schema.ts";

async function getUserBySupabaseId(supabaseId: string): Promise<PublicUserDto> {
  const user = await userRepository.findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return publicUserSchema.parse(user);
}

async function updateUser(
  supabaseId: string,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!supabaseId) throw new AuthenticationError();

  const existingUser = await userRepository.findBySupabaseId(supabaseId);
  if (!existingUser) throw new UserNotFoundError();

  const info = updateUserSchema.parse(updatedUserInfo);
  await userRepository.updateUserBySupabaseId(supabaseId, info);
}

async function getUserIdBySupabaseId(supabaseId: string): Promise<string> {
  const user = await userRepository.findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return user.id;
}

/* Only used for internal purposes */
async function getBySupabaseId(supabaseId: string): Promise<User> {
  const user = await userRepository.findBySupabaseId(supabaseId);
  if (!user) throw new UserNotFoundError();

  return user;
}

export const userService = {
  getUserBySupabaseId,
  updateUser,
  getUserIdBySupabaseId,
  getBySupabaseId,
};
