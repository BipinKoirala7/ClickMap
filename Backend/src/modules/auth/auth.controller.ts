import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { authService } from "./auth.service.ts";

async function registerController(req: Request, res: Response) {
  await authService.registerUser(req.body);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Registered", null));
}

async function loginController(req: Request, res: Response) {
  await authService.loginUser(req.body, res);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Logged In", null));
}

async function refreshTokenController(req: Request, res: Response) {
  await authService.refreshToken(req, res);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "Token Refreshed", null));
}

async function logoutController(req: Request, res: Response) {
  await authService.logout(req, res);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Logged Out", null));
}

async function deactivateUserController(req: Request, res: Response) {
  const userId = req.userId;
  await authService.deactivateUserStatus(userId);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Account DeActivated", null));
}

async function activateUserController(req: Request, res: Response) {
  const userId = req.userId;
  await authService.activateUserStatus(userId);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Account Activated", null));
}

export const authController = {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  deactivateUserController,
  activateUserController,
};
