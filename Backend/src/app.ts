import "@/openapi/zod-extends.ts";

import express, { type Request } from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import { generateOpenApiDoc } from "./openapi/generate.ts";
import { config } from "./config/config.ts";
import { errorHandler } from "./errors/errorHandler.ts";
import RestApiResponse from "./types/RestApiResponse.ts";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.ts";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes.ts";

const app = express();

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(config.MORGAN_PROFILE));

app.use(
  pinoHttp({
    logger,
    genReqId: (req: Request) =>
      (req.headers["x-request-id"] as string) || nanoid(),
  }),
);

const openApiDoc = generateOpenApiDoc();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
app.get("/api-docs.json", (_, res) => {
  res.json(openApiDoc);
});

app.use("/api/v1", apiRouter);

app.use((_req, res) => {
  res.status(404).json(RestApiResponse.error(404, "Route not found"));
});
app.use(errorHandler);

export default app;
