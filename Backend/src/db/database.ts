import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { config } from "../config/index.ts";
import { clickEvents, link, users } from "./schema.ts";

const connection = new Client({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(connection, { schema: { users, link, clickEvents } });
