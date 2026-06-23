import { Router } from "express";
import app from "./index.js";
import linkRouter from "@/modules/links/links.routes.js";
import userRouter from "@/modules/user/user.routes.ts";
import authRouter from "@/modules/auth/auth.routes.ts";
import analyticsRouter from "@/modules/analytics/analytics.routes.ts";

const apiRouter = Router();

apiRouter.use("/link", linkRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/anallytics", analyticsRouter);

app.use("/api/v1", apiRouter);
