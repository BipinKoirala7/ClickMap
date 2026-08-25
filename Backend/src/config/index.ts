import { configDotenv } from "dotenv";
import * as z from "zod";

configDotenv();

const envSchema = z.object({
  // Application configuration
  PORT: z.string().nonempty().default("3000"),

  // Database configuration
  DATABASE_URL: z.string().nonempty(),

  // JWT configuration
  JWT_SECRET: z.string().nonempty(),
  ACCESS_TOKEN_EXPIRATION: z.coerce.number().positive().default(900000),
  REFRESH_TOKEN_EXPIRATION: z.coerce.number().positive().default(604800000),

  // Cookie configuration
  COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  COOKIE_SECURE: z.coerce.boolean().default(true),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
  COOKIE_ACCESS_TOKEN_PATH: z.string().min(1).default("/"),
  COOKIE_REFRESH_TOKEN_PATH: z.string().min(1).default("/api/v1/auth/refresh"),

  // Bcrypt configuration
  BCRYPT_SALT_ROUNDS: z.coerce.number().positive().default(12),

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
