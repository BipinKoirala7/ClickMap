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
import { userStatusAction } from "@/types/types";
import { logger } from "@/lib/logger";
import redisClient from "@/lib/redisConnect";

async function getUserById(id: string | undefined): Promise<PublicUserDto> {
  if (!id || id.trim().length == 0) throw new AuthenticationError();
  const redisKey = `user:${id}`;

  const cached = await redisClient.get(redisKey);
  if (cached) return publicUserSchema.parse(JSON.parse(cached));

  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  const publicUser = publicUserSchema.parse(user);
  redisClient.set(redisKey, JSON.stringify(publicUser), {
    expiration: {
      type: "EX",
      value: 3600,
    },
  });
  return publicUser;
}

async function updateUser(
  id: string | undefined,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!id || id.trim().length == 0) throw new AuthenticationError();

  const existingUser = await userRepository.findById(id);
  if (!existingUser) throw new UserNotFoundError();

  const info = updateUserSchema.parse(updatedUserInfo);
  await userRepository.updateUserById(id, info);
  await invalidateUserCache(id);
}

async function updateUserStatus(
  id: string | undefined,
  action: userStatusAction,
) {
  if (!id || id.trim().length == 0) {
    logger.warn("activateUserStatus called with undefined ID");
    throw new AuthenticationError();
  }

  const user = await getById(id);

  if (action === userStatusAction.DEACTIVATE) {
    if (!user.isActive) throw new UserAlreadyDeactivatedError();
    await userRepository.deactivateUser(id);
    await invalidateUserCache(id);
  } else {
    if (user.isActive) throw new UserAlreadyActiveError();
    await userRepository.activateUser(id);
    await invalidateUserCache(id);
  }
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

async function invalidateUserCache(id: string) {
  try {
    await redisClient.del(`user:${id}`);
  } catch (err) {
    logger.warn({ err }, "Failed to invalidate user cache");
  }
}

export const userService = {
  getUserById,
  updateUser,
  updateUserStatus,
  getById,
  getByEmail,
};
