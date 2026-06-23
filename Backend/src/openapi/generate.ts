import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.ts";

import "@/modules/auth/auth.openapi.ts";
import "@/modules/user/user.openapi.ts";
import "@/modules/links/link.openapi.ts";
import "@/modules/analytics/analytics.openapi.ts";

export function generateOpenApiDoc() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: { title: "ClickMap API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
  });
}
