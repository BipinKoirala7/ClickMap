import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import { generateOpenApiDoc } from "./openapi/generate.ts";
import { config } from "./config/index.ts";

const app = express();

app.use(cors());

const openApiDoc = generateOpenApiDoc();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
app.get("/api-docs.json", (_, res) => {
  res.json(openApiDoc);
});

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

export default app;
