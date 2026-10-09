import {
  AuthenticationError,
  UserAlreadyActiveError,
  UserAlreadyDeactivatedError,
  UserNotActiveError,
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
import { config } from "@/config/config";

async function getUserById(id: string | undefined): Promise<PublicUserDto> {
  if (!id || id.trim().length == 0) throw new AuthenticationError();

  const cached = await readCacheUser(id);
  if (cached) return cached;

  const user = await userRepository.findById(id);
  if (!user) throw new UserNotFoundError();

  const publicUser = publicUserSchema.parse(user);
  await createUserCache(publicUser, id);
  return publicUser;
}

async function updateUser(
  id: string | undefined,
  updatedUserInfo: UpdateUserDto,
): Promise<void> {
  if (!id || id.trim().length == 0) throw new AuthenticationError();

  const info = updateUserSchema.parse(updatedUserInfo);
  const existingUser = await userRepository.findById(id);

  if (!existingUser) throw new UserNotFoundError();

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

function getUserRedisKey(id: string) {
  return `user:${id}`;
}

async function createUserCache(user: PublicUserDto, id: string) {
  try {
    await redisClient.set(getUserRedisKey(id), JSON.stringify(user), {
      expiration: { type: "EX", value: config.REDIS_TTL },
    });
  } catch (err) {
    logger.warn({ err }, "Failed to create User Cache");
  }
}

async function readCacheUser(id: string): Promise<PublicUserDto | null> {
  try {
    const cached = await redisClient.get(getUserRedisKey(id));
    return cached ? publicUserSchema.parse(JSON.parse(cached)) : null;
  } catch (err) {
    logger.warn({ err }, "Failed to get the cach user");
    return null;
  }
}

async function invalidateUserCache(id: string) {
  try {
    await redisClient.del(getUserRedisKey(id));
  } catch (err) {
    logger.warn({ err }, "Failed to invalidate user cache");
  }
}

async function getActiveUser(userId: string) {
  const user = await userService.getById(userId);
  if (!user.isActive) {
    logger.warn("User is not active");
    throw new UserNotActiveError();
  }
  return user;
}

export const userService = {
  getUserById,
  updateUser,
  updateUserStatus,
  getById,
  getByEmail,
  getActiveUser,
  getUserRedisKey,
  createUserCache,
  readCacheUser,
  invalidateUserCache,
};
