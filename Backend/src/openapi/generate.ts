import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.ts";

export function generateOpenApiDoc() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: { title: "ClickMap API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
  });
}
