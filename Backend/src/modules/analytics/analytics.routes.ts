import { authenticate } from "@/middleware/authenticate";
import { Router } from "express";
import { analyticsController } from "./analytics.controller";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get("/overview", analyticsController.getOverviewAnalytics);

export default analyticsRouter;
