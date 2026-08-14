import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { type PublicUserDto } from "./user.schema.ts";
import { userService } from "./user.service.ts";

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

export const userController = {
  getUserController,
  updateUserController,
};
