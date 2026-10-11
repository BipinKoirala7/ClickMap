import { Router } from "express";
import { redirectController } from "./redirect.controller";
import { visitorIdInfo } from "@/middleware/redirectVisitorId";

const redirectRouter = Router();

redirectRouter.get(
  "/:shortCode",
  visitorIdInfo,
  redirectController.getLinkURLByShortCode,
);

export default redirectRouter;
