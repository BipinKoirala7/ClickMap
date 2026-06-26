import {
  LinkAlreadyActiveError,
  LinkAlreadyDeactivatedError,
  LinkNotFoundError,
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

async function createLink(supabaseId: string, dto: CreateLinkDto) {
  const user = await userService.getBySupabaseId(supabaseId);
  const link = createLinkSchema.parse(dto);
  const newLink: NewLink = {
    userId: user.id,
    ...link,
  };

  await linkRepository.createLink(newLink);
}

async function getUserLinks(supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  return await linkRepository.getUserLinks(user.id);
}

async function getLinkInfo(linkId: string, supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  return link;
}

async function updateLink(
  linkId: string,
  supabaseId: string,
  linkData: UpdateLinkDto,
) {
  const user = await userService.getBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  const data = updateLinkSchema.parse(linkData);

  return await linkRepository.updateLink(linkId, user.id, data);
}

async function activateLink(linkId: string, supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  if (link.isActive) throw new LinkAlreadyActiveError();
  return await linkRepository.activateLink(linkId, user.id);
}

async function deactivateLink(linkId: string, supabaseId: string) {
  const user = await userService.getBySupabaseId(supabaseId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  if (!link.isActive)
    throw new LinkAlreadyDeactivatedError("Link is already deactivated");
  return await linkRepository.deactivateLink(linkId, user.id);
}

export const linkService = {
  createLink,
  getUserLinks,
  getLinkInfo,
  updateLink,
  activateLink,
  deactivateLink,
};
