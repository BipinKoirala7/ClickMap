import { Router } from "express";
import { userController } from "./user.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/", userController.getUserController);
userRouter.put("/", userController.updateUserController);

export default userRouter;
