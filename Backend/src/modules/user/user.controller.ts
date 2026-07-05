import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { type PublicUserDto } from "./user.schema.ts";
import { userService } from "./user.service.ts";

//  Change the id to get from the cookies
async function getUserController(req: Request, res: Response) {
  const id = req.user!.sub;
  res
    .status(200)
    .json(
      RestApiResponse.success<PublicUserDto>(
        200,
        "Success",
        await userService.getUserById(id),
      ),
    );
}

async function updateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub;
  await userService.updateUser(supabaseId, req.body);
  res.status(200).json(RestApiResponse.success(200, "User Info Updated", null));
}

export const userController = {
  getUserController,
  updateUserController,
};
