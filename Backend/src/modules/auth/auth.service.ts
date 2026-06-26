import { userRepository } from "@/modules/user/user.repository.ts";

import {
  UserAlreadyDeactivatedError,
  UserAlreadyActiveError,
  UserNotFoundError,
} from "@/errors/Errors.ts";
import { userService } from "../user/user.service.ts";

async function activateUserStatus(supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  if (user.isActive) throw new UserAlreadyActiveError();

  return userRepository.updateUserStatus(user.id, true);
}

async function deactivateUserStatus(supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  if (!user.isActive) throw new UserAlreadyDeactivatedError();

  return userRepository.updateUserStatus(user.id, false);
}

export const authService = {
  activateUserStatus,
  deactivateUserStatus,
};
