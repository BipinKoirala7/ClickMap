import { Router } from "express";
import {
  createUserController,
  updateUserController,
} from "./user.controller.ts";

const userRouter = Router();

userRouter.post("/", createUserController);
userRouter.put("/", updateUserController);

export default userRouter;
