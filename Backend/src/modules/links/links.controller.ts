import { type Request, type Response } from "express";
import {
  activateLink,
  createLink,
  deactivateLink,
  getLinkInfo,
  getUserLinks,
  updateLink,
} from "./links.service.ts";
import RestApiResponse from "@/types/RestApiResponse.ts";
import { LinkNotFoundError } from "@/errors/Errors.ts";

export async function createLinkController(req: Request, res: Response) {
  await createLink(req.user!.sub, req.body);

  res
    .status(201)
    .json(RestApiResponse.success(201, "Link created successfully", null));
}

export async function getAllLinksController(req: Request, res: Response) {
  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "User Links Fetched Successfully",
        await getUserLinks(req.user!.sub),
      ),
    );
}

export async function getLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");
  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "OK",
        await getLinkInfo(linkId, req.user!.sub),
      ),
    );
}

export async function updateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await updateLink(linkId, req.user!.sub, req.body);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

export async function deactivateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await deactivateLink(linkId, req.user!.sub);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

export async function activateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await activateLink(linkId, req.user!.sub);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}
