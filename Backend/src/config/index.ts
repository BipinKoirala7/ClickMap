import { configDotenv } from "dotenv";
import * as z from "zod";

configDotenv();

const envSchema = z.object({
  // Application configuration
  PORT: z.string().nonempty(),

  // Database configuration
  DATABASE_URL: z.string().nonempty(),

  // JWT configuration
  JWT_SECRET: z.string().nonempty(),
  ACCESS_TOKEN_EXPIRATION: z.string().nonempty().default("90000"),
  REFRESH_TOKEN_EXPIRATION: z.string().nonempty().default("604800000"),

  // Logging configuration
  NODE_ENV: z.string().nonempty(),
  MORGAN_PROFILE: z.string().nonempty(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error).errors);
  process.exit(1);
}

export const config = parsed.data;
