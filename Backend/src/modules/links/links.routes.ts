import { Router } from "express";
import { linkController } from "./links.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const linkRouter = Router();

linkRouter.use(authenticate);

linkRouter.post("/", linkController.createLinkController);
linkRouter.get("/", linkController.getAllLinksController);
linkRouter.get("/:id", linkController.getLinkController);
linkRouter.put("/:id", linkController.updateLinkController);
linkRouter.patch("/:id/deactivate", linkController.deactivateLinkController);
linkRouter.patch("/:id/activate", linkController.activateLinkController);

export default linkRouter;
