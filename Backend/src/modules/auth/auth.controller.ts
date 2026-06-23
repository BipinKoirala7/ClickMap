import { AuthenticationError } from "@/errors/Errors.ts";
import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";

export async function deActivateUserController(req: Request, res: Response) {
  const supabaseId = req.user?.sub as string;
  if (!supabaseId) {
    throw new AuthenticationError();
  }
  res
    .status(200)
    .json(RestApiResponse.success(200, "User Account DeActivated", null));
}

export async function activateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub as string;
  if (!supabaseId) {
    throw new AuthenticationError();
  }
  res
    .status(200)
    .json(RestApiResponse.success(200, "User Account Activated", null));
}
