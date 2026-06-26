import { Router } from "express";
import { getUserController, updateUserController } from "./user.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/", getUserController);
userRouter.put("/", updateUserController);

export default userRouter;
