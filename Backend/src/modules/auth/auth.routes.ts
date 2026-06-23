import { Router } from "express";
import { deActivateUserController } from "./auth.controller.ts";
import { activateLinkController } from "../links/links.controller.ts";

const authRouter = Router();

authRouter.post("/activate", activateLinkController);
authRouter.post("/deactivate", deActivateUserController);

export default authRouter;
