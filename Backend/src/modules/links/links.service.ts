import {
  LinkAlreadyActiveError,
  LinkAlreadyDeactivatedError,
  LinkNotFoundError,
  UserNotFoundError,
} from "@/errors/Errors.ts";
import {
  createLinkSchema,
  updateLinkSchema,
  type CreateLinkDto,
  type NewLink,
  type UpdateLinkDto,
} from "./links.schema.ts";
import { linkRepository } from "./links.repository.ts";
import { userService } from "../user/user.service.ts";

export async function createLink(supabaseId: string, dto: CreateLinkDto) {
  if (!(await userService.getUserBySupabaseId(supabaseId)))
    throw new UserNotFoundError();
  const link = createLinkSchema.parse(dto);
  const newLink: NewLink = {
    userId: await userService.getUserIdBySupabaseId(supabaseId),
    ...link,
  };

  await linkRepository.createLink(newLink);
}

export async function getUserLinks(supabaseId: string) {
  if (!(await userService.getUserBySupabaseId(supabaseId)))
    throw new UserNotFoundError();

  const userId = await userService.getUserIdBySupabaseId(supabaseId);
  return await linkRepository.getUserLinks(userId);
}

export async function getLinkInfo(linkId: string, supabaseId: string) {
  const userId = await userService.getUserIdBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, userId);

  if (!link) throw new LinkNotFoundError();
  return link;
}

export async function updateLink(
  linkId: string,
  supabaseId: string,
  linkData: UpdateLinkDto,
) {
  const userId = await userService.getUserIdBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, userId);

  if (!link) throw new LinkNotFoundError();
  const data = updateLinkSchema.parse(linkData);

  return await linkRepository.updateLink(linkId, userId, data);
}

export async function activateLink(linkId: string, supabaseId: string) {
  const userId = await userService.getUserIdBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, userId);

  if (!link) throw new LinkNotFoundError();
  if (link.isActive) throw new LinkAlreadyActiveError();
  return await linkRepository.activateLink(linkId, userId);
}

export async function deactivateLink(linkId: string, supabaseId: string) {
  const userId = await userService.getUserIdBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, userId);

  if (!link) throw new LinkNotFoundError();
  if (!link.isActive)
    throw new LinkAlreadyDeactivatedError("Link is already deactivated");
  return await linkRepository.deactivateLink(linkId, userId);
}
