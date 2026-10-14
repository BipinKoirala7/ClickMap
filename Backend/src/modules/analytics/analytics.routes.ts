import { authenticate } from "@/middleware/authenticate";
import { Router } from "express";
import { analyticsController } from "./analytics.controller";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);

// Overview analytics route
analyticsRouter.get("/overview/stats", analyticsController.getOverviewStats);
analyticsRouter.get(
  "/overview/clicks-over-time",
  analyticsController.getClicksOverTime,
);
analyticsRouter.get(
  "/overview/recent-links",
  analyticsController.getUserRecentLinks,
);

analyticsRouter.get("/", analyticsController.getAnalytics);
analyticsRouter.get("/:linkId", analyticsController.getLinkAnalytics);

export default analyticsRouter;
