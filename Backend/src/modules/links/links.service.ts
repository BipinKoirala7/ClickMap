import {
  AuthenticationError,
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
import { linkRepository } from "@/modules/links/links.repository.ts";
import { userService } from "@/modules/user/user.service.ts";

async function createLink(userId: string | undefined, dto: CreateLinkDto) {
  if (!userId || userId.length < 1) {
    throw new AuthenticationError();
  }

  const user = await userService.getById(userId);
  const link = createLinkSchema.parse(dto);
  const newLink: NewLink = {
    userId: user.id,
    ...link,
  };

  await linkRepository.createLink(newLink);
}

async function getUserLinks(userId: string | undefined) {
  if (!userId) throw new AuthenticationError();
  const user = await userService.getById(userId);
  return await linkRepository.getUserLinks(user.id);
}

async function getLinkInfo(linkId: string, userId: string | undefined) {
  if (!userId) throw new AuthenticationError();
  const user = await userService.getById(userId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  return link;
}

async function updateLink(
  linkId: string,
  userId: string | undefined,
  linkData: UpdateLinkDto,
) {
  if (!userId) throw new AuthenticationError();
  const user = await userService.getById(userId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  const data = updateLinkSchema.parse(linkData);

  return await linkRepository.updateLink(linkId, user.id, data);
}

async function activateLink(linkId: string, userId: string | undefined) {
  if (!userId) throw new AuthenticationError();
  const user = await userService.getById(userId);
  const link = await linkRepository.getLink(linkId, user.id);

  if (!link) throw new LinkNotFoundError();
  if (link.isActive) throw new LinkAlreadyActiveError();
  return await linkRepository.activateLink(linkId, user.id);
}

async function deactivateLink(linkId: string, userId: string | undefined) {
  if (!userId) throw new AuthenticationError();
  const user = await userService.getById(userId);
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
