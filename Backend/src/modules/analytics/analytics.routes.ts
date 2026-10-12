import { authenticate } from "@/middleware/authenticate";
import { Router } from "express";
import { analyticsController } from "./analytics.controller";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get("/overview", analyticsController.getOverviewAnalytics);
analyticsRouter.get("/", analyticsController.getAnalytics);
analyticsRouter.get("/:linkId", analyticsController.getLinkAnalytics);

export default analyticsRouter;
