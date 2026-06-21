import { Router } from "express";
import { registerUserController } from "./auth.controller.ts";

const authRouter = Router();

authRouter.post("/register", registerUserController);
authRouter.post("/login", registerUserController);
authRouter.post("/logout", registerUserController);
authRouter.post("/deactivate", registerUserController);
authRouter.post("/refresh-token", registerUserController);

export default authRouter;
