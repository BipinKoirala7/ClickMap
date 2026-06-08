import { configDotenv } from "dotenv";
import * as z from "zod";

configDotenv();

const envSchema = z.object({
  POSTGRES_PORT: z.string().default("3000").transform(z.number),
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string().default("clickmap"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error).errors);
  process.exit(1);
}

export const config = parsed.data;
