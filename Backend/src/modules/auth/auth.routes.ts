import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const authRouter = Router();

authRouter.use(authenticate);

authRouter.post("/activate", authController.activateUserController);
authRouter.post("/deactivate", authController.deactivateUserController);

export default authRouter;
