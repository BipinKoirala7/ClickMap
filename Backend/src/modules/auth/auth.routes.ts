import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const authRouter = Router();

// Public routes - no authentication middleware required
authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);
authRouter.post("/refresh", authController.refreshTokenController);

// Protected routes - authentication middleware required
authRouter.post("/logout", authenticate, authController.logoutController);
authRouter.post(
  "/activate",
  authenticate,
  authController.activateUserController,
);
authRouter.post(
  "/deactivate",
  authenticate,
  authController.deactivateUserController,
);

export default authRouter;
