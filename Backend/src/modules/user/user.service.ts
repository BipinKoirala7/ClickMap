import {
  AuthenticationError,
  UserAlreadyActiveError,
  UserAlreadyDeactivatedError,
  UserNotFoundError,
} from "@/errors/Errors.ts";
import { userRepository } from "@/modules/user/user.repository.ts";
import {
  publicUserSchema,
  updateUserSchema,
  type PublicUserDto,
  type UpdateUserDto,
} from "@/modules/user/user.schema.ts";
import type { User } from "@/modules/auth/auth.schema.ts";

async function getUserById(id: string | undefined): Promise<PublicUserDto> {
  if (!id || id.length < 1) throw new AuthenticationError();
  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  return publicUserSchema.parse(user);
}

async function updateUser(
  id: string | undefined,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!id || id.length < 1) throw new AuthenticationError();

  const existingUser = await userRepository.findById(id);
  if (!existingUser) throw new UserNotFoundError();

  const info = updateUserSchema.parse(updatedUserInfo);
  await userRepository.updateUserById(id, info);
}

async function deactivateUser(id: string | undefined): Promise<void> {
  if (!id || id.length < 1) throw new AuthenticationError();

  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  if (user.isActive) throw new UserAlreadyDeactivatedError();

  await userRepository.deactivateUser(id);
}

async function activateUser(id: string | undefined): Promise<void> {
  if (!id || id.length < 1) throw new AuthenticationError();

  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  if (!user.isActive) throw new UserAlreadyActiveError();

  await userRepository.activateUser(id);
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
  activateUser,
  deactivateUser,
  getById,
  getByEmail,
};
