import type { Express } from "express";

/**
 * Imports your real app.ts (cors, json parsing, cookie-parser, morgan,
 * pino-http, swagger, the full /api/v1 router tree, 404 handler,
 * errorHandler — all of it) rather than reassembling a partial app here.
 * Tests then exercise the exact wiring that runs in production.
 *
 * Must be called AFTER startTestDb() has set process.env.DATABASE_URL —
 * see the comment in testDb.ts for why this has to be a dynamic import.
 */
export async function buildTestApp(): Promise<Express> {
  const { default: app } = await import("@/app.ts");
  return app;
}
