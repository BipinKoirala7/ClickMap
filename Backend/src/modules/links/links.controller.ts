import { type Request, type Response } from "express";
import { createLinkSchema } from "./links.schema.ts";
import { createLink } from "./links.service.ts";

export async function createLinkController(req: Request, res: Response) {
  await createLink(req.body);

  res.status(200).json({ message: "Done" });
}

export async function getAllLinksController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function getLinkController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function updateLinkController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function deactivateLinkController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function activateLinkController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}
