import { Router } from "express";
import app from "./index.js";
import linkRouter from "./modules/links/links.routes.js";

const apiRouter = Router();

apiRouter.use("/link", linkRouter);

app.use("/api/v1", apiRouter);
