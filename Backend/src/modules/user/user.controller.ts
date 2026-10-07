import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { type PublicUserDto } from "@/modules/user/user.schema.ts";
import { userService } from "@/modules/user/user.service.ts";
import { userStatusAction } from "@/types/types";

async function getUserController(req: Request, res: Response) {
  const id = req.userId;
  return res
    .status(200)
    .json(
      RestApiResponse.success<PublicUserDto>(
        200,
        "User Info Successfully Fetched",
        await userService.getUserById(id),
      ),
    );
}

async function updateUserController(req: Request, res: Response) {
  const id = req.userId;
  await userService.updateUser(id, req.body);
  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Info Updated", null));
}

async function deactivateUser(req: Request, res: Response) {
  const id = req.userId;
  await userService.updateUserStatus(id, userStatusAction.DEACTIVATE);

  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Deactivated", null));
}

async function activateUser(req: Request, res: Response) {
  const id = req.userId;
  await userService.updateUserStatus(id, userStatusAction.ACTIVATE);

  return res
    .status(200)
    .json(RestApiResponse.success(200, "User Activated", null));
}

export const userController = {
  getUserController,
  updateUserController,
  activateUser,
  deactivateUser,
};
