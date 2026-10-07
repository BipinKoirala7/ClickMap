import { authenticate } from "@/middleware/authenticate";
import { Router } from "express";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);

export default analyticsRouter;
