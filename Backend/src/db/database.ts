import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config/index.ts";
import { activeRefreshTokens, clickEvents, links, users } from "./schema.ts";

const connection = new Pool({
  connectionString: config.DATABASE_URL,
});

connection.addListener("connect", () => {
  console.log("Database connected successfully");
});

export const db = drizzle(connection, {
  schema: { users, activeRefreshTokens, links, clickEvents },
});
