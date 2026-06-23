import { Router } from "express";
import linkRouter from "@/modules/links/links.routes.ts";
import userRouter from "@/modules/user/user.routes.ts";
import authRouter from "@/modules/auth/auth.routes.ts";
import analyticsRouter from "@/modules/analytics/analytics.routes.ts";

const apiRouter = Router();

apiRouter.use("/user", userRouter);
apiRouter.use("/link", linkRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/anallytics", analyticsRouter);

export { apiRouter };
