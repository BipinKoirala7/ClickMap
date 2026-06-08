import { type Request, type Response } from "express";
import { createLinkSchema } from "./links.schema.js";
import { createLink } from "./links.service.js";

export async function createLinnk(req: Request, res: Response) {
  const body = createLinkSchema.parse(req.body);
  await createLink(body);

  res.status(200).json({ message: "Done" });
}
