import zod from "zod";

const envSchema = zod.object({
  API_URL: zod.url().nonempty().default("http://localhost:4000/api/v1"),
  API_TIMEOUT: zod.number().int().positive().default(10000),
  ACCESS_TOKEN_COOKIE_PLACEHOLDER: zod
    .string()
    .nonempty()
    .default("accessToken"),
  REFRESH_TOKEN_COOKIE_PLACEHOLDER: zod
    .string()
    .nonempty()
    .default("refreshToken"),
});

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
  ACCESS_TOKEN_COOKIE_PLACEHOLDER:
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_PLACEHOLDER,
  REFRESH_TOKEN_COOKIE_PLACEHOLDER:
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_PLACEHOLDER,
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
