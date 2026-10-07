import { Router } from "express";
import { redirectController } from "./redirect.controller";

const redirectRouter = Router();

redirectRouter.get("/:shortCode", redirectController.getLinkURLByShortCode);

export default redirectRouter;
