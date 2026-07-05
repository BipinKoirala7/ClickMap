import "@/openapi/zod-extends.ts";

import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import { generateOpenApiDoc } from "./openapi/generate.ts";
import { config } from "./config/index.ts";
import { apiRouter } from "./app.ts";
import { errorHandler } from "./errorHandler.ts";
import RestApiResponse from "./types/RestApiResponse.ts";

const app = express();
const cookieParser = await import("cookie-parser");

app.use(cors());
app.use(express.json());
app.use(cookieParser.default());

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

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
