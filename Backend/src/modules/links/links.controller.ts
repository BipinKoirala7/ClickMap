import { type Request, type Response } from "express";
import { linkService } from "./links.service.ts";
import RestApiResponse from "@/types/RestApiResponse.ts";
import { LinkNotFoundError } from "@/errors/Errors.ts";

async function createLinkController(req: Request, res: Response) {
  await linkService.createLink(req.user!.sub, req.body);

  res
    .status(201)
    .json(RestApiResponse.success(201, "Link created successfully", null));
}

async function getAllLinksController(req: Request, res: Response) {
  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "User Links Fetched Successfully",
        await linkService.getUserLinks(req.user!.sub),
      ),
    );
}

async function getLinkController(req: Request<{ id: string }>, res: Response) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");
  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "OK",
        await linkService.getLinkInfo(linkId, req.user!.sub),
      ),
    );
}

async function updateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await linkService.updateLink(linkId, req.user!.sub, req.body);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

async function deactivateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await linkService.deactivateLink(linkId, req.user!.sub);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

async function activateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  const linkId = req.params.id;
  if (!linkId) throw new LinkNotFoundError("Link ID is required");

  await linkService.activateLink(linkId, req.user!.sub);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

export const linkController = {
  createLinkController,
  getAllLinksController,
  getLinkController,
  updateLinkController,
  deactivateLinkController,
  activateLinkController,
};
