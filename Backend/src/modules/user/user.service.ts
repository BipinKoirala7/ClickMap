import { AuthenticationError, UserNotFoundError } from "@/errors/Errors.ts";
import { userRepository } from "./user.repository.ts";
import {
  publicUserSchema,
  updateUserSchema,
  type PublicUserDto,
  type UpdateUserDto,
} from "./user.schema.ts";
import type { User } from "../auth/auth.schema.ts";

async function getUserById(id: string | undefined): Promise<PublicUserDto> {
  if (!id) throw new AuthenticationError();
  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  return publicUserSchema.parse(user);
}

async function updateUser(
  id: string | undefined,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!id) throw new AuthenticationError();

  const existingUser = await userRepository.findById(id);
  if (!existingUser) throw new UserNotFoundError();

  const info = updateUserSchema.parse(updatedUserInfo);
  await userRepository.updateUserById(id, info);
}

/* Only used for internal purposes */
async function getById(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  return user;
}

async function getByEmail(email: string): Promise<User> {
  const user = await userRepository.findByEmail(email);

  if (!user) throw new UserNotFoundError();
  return user;
}

export const userService = {
  getUserById,
  updateUser,
  getById,
  getByEmail,
};
