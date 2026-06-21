import { Router } from "express";
import {
  createLinkController,
  getAllLinksController,
  getLinkController,
  updateLinkController,
  deactivateLinkController,
  activateLinkController,
} from "./links.controller.ts";

const linkRouter = Router();

linkRouter.post("/", createLinkController);
linkRouter.get("/", getAllLinksController);
linkRouter.get("/:id", getLinkController);
linkRouter.put("/:id", updateLinkController);
linkRouter.patch("/:id/deactivate", deactivateLinkController);
linkRouter.patch("/:id/activate", activateLinkController);

export default linkRouter;
