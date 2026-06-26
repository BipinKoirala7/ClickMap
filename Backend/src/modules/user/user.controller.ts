import RestApiResponse from "@/types/RestApiResponse.ts";
import { type Request, type Response } from "express";
import { type PublicUserDto } from "./user.schema.ts";
import { getUserBySupabaseId, updateUser } from "./user.service.ts";

export async function getUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub;
  res
    .status(200)
    .json(
      RestApiResponse.success<PublicUserDto>(
        200,
        "Success",
        await getUserBySupabaseId(supabaseId),
      ),
    );
}

export async function updateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub;
  await updateUser(supabaseId, req.body);
  res.status(200).json(RestApiResponse.success(200, "User Info Updated", null));
}
