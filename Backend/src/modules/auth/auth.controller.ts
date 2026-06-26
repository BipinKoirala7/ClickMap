import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { authService } from "./auth.service.ts";

async function deactivateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub;
  await authService.deactivateUserStatus(supabaseId);
  res
    .status(200)
    .json(RestApiResponse.success(200, "User Account DeActivated", null));
}

async function activateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub;
  await authService.activateUserStatus(supabaseId);
  res
    .status(200)
    .json(RestApiResponse.success(200, "User Account Activated", null));
}

export const authController = {
  deactivateUserController,
  activateUserController,
};
