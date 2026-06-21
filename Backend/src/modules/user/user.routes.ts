import { Router } from "express";
import { getUserController, updateUserController } from "./user.controller.ts";

const userRouter = Router();

userRouter.get("/", getUserController);
userRouter.put("/", updateUserController);

export default userRouter;
