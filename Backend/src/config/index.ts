import { configDotenv } from "dotenv";
import * as z from "zod";

configDotenv();

const envSchema = z.object({
  PORT: z.string().nonempty(),
  DATABASE_URL: z.string().nonempty(),
  SUPABASE_URL: z.string().nonempty(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error).errors);
  process.exit(1);
}

export const config = parsed.data;
