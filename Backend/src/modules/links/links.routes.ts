import { Router } from "express";
import {
  createLinkController,
  deleteLinkController,
  getAllLinksController,
  getLinkController,
  updateLinkController,
} from "./links.controller.ts";

const linkRouter = Router();

linkRouter.post("/", createLinkController);
linkRouter.get("/", getAllLinksController);
linkRouter.get("/:id", getLinkController);
linkRouter.put("/:id", updateLinkController);
linkRouter.delete("/:id", deleteLinkController);

export default linkRouter;
