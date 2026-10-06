import { Router } from "express";
import { redirectController } from "./redirect.controller";

const redirectRouter = Router();

redirectRouter.get("/:shortUrl", redirectController.getLinkURLByShortUrl);

export default redirectRouter;
