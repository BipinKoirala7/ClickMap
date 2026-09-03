import { Router } from "express";
import { authController } from "./auth.controller.ts";
import {
  authenticate,
  authenticateRefreshToken,
} from "@/middleware/authenticate.ts";

const authRouter = Router();

// Public routes - no authentication middleware required
authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);

// Protected routes - authentication middleware required
// Refresh token validation
// No Access token validation
authRouter.post(
  "/refresh",
  authenticateRefreshToken,
  authController.refreshTokenController,
);
authRouter.post(
  "/logout",
  authenticateRefreshToken,
  authController.logoutController,
);

// Access Token validation
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
