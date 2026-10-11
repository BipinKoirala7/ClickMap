import { type Request, type Response } from "express";
import { linkService } from "./links.service.ts";
import RestApiResponse from "@/types/RestApiResponse.ts";

async function createLinkController(req: Request, res: Response) {
  await linkService.createLink(req.userId, req.body);

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
        await linkService.getUserLinks(req.userId),
      ),
    );
}

async function getLinkController(
  req: Request<{ id: string | undefined }>,
  res: Response,
) {
  const linkId = req.params.id;
  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "OK",
        await linkService.getLinkInfo(linkId, req.userId),
      ),
    );
}

async function updateLinkController(
  req: Request<{ id: string | undefined }>,
  res: Response,
) {
  await linkService.updateLink(req.params.id, req.userId, req.body);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

async function deactivateLinkController(
  req: Request<{ id: string | undefined }>,
  res: Response,
) {
  await linkService.deactivateLink(req.params.id, req.userId);
  res.status(200).json(RestApiResponse.success(200, "OK", null));
}

async function activateLinkController(
  req: Request<{ id: string }>,
  res: Response,
) {
  await linkService.activateLink(req.params.id, req.userId);
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
