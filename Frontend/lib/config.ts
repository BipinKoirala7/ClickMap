import zod from "zod";

const envSchema = zod.object({
  API_URL: zod.url().nonempty().default("http://localhost:3000/api/v1"),
  API_TIMEOUT: zod.number().int().positive().default(10000),
});

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
};

const parsedEnv = envSchema.safeParse(config);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    zod.treeifyError(parsedEnv.error).errors,
  );
  throw new Error("Invalid environment variables");
}

export default parsedEnv.data;
