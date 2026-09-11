import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@/db/schema.ts";
import type { db as ProdDb } from "@/db/database.ts";

type AppDb = typeof ProdDb;

let container: StartedPostgreSqlContainer;
let pool: Pool;
let db: AppDb;

/**
 * Spins up a real Postgres container and points DATABASE_URL at it.
 *
 * `@/db/database.ts` constructs its Pool eagerly at module-import time
 * from `config.DATABASE_URL`, so this must run — and the env var must be
 * set — BEFORE anything imports `@/app.ts` (directly or transitively).
 * That's why `buildTestApp()` in testApp.ts uses a dynamic `import()`
 * instead of a static one: static imports get hoisted and would run
 * before this function's env mutation ever executes.
 */
export async function startTestDb() {
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("clickmap-test")
    .start();

  const connectionString = container.getConnectionUri();
  process.env.DATABASE_URL = connectionString;

  pool = new Pool({ connectionString });
  db = drizzle(pool, {
    schema: {
      users: schema.users,
      activeRefreshTokens: schema.activeRefreshTokens,
      links: schema.links,
      clickEvents: schema.clickEvents,
    },
  });

  await migrate(db, { migrationsFolder: "./drizzle" });

  return db;
}

export async function stopTestDb() {
  const { closeDb } = await import("@/db/database.ts");
  await closeDb();
  await pool?.end();
  await container?.stop();
}

export async function clearTestDb() {
  // FK order matters: click_events -> links -> active_refresh_tokens -> users
  await db.execute(`TRUNCATE TABLE
    "click_events",
    "links",
    "active_refresh_tokens",
    "users"
    RESTART IDENTITY CASCADE`);
}

export function getTestDb() {
  return db;
}
