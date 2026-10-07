import { Router } from "express";
import { userController } from "@/modules/user/user.controller.ts";
import { authenticate } from "@/middleware/authenticate.ts";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", userController.getUserController);
userRouter.put("/", userController.updateUserController);
userRouter.patch("/activate", userController.activateUser);
userRouter.patch("/deactivate", userController.deactivateUser);

export default userRouter;
