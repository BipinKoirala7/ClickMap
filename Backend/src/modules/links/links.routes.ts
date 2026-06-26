import { Router } from "express";
import {
  createLinkController,
  getAllLinksController,
  getLinkController,
  updateLinkController,
  deactivateLinkController,
  activateLinkController,
} from "./links.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const linkRouter = Router();

linkRouter.use(authenticate);

linkRouter.post("/", createLinkController);
linkRouter.get("/", getAllLinksController);
linkRouter.get("/:id", getLinkController);
linkRouter.put("/:id", updateLinkController);
linkRouter.patch("/:id/deactivate", deactivateLinkController);
linkRouter.patch("/:id/activate", activateLinkController);

export default linkRouter;
