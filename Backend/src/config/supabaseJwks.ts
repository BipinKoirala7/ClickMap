import { createRemoteJWKSet } from "jose";
import { config } from "./index.ts";

export const PROJECT_JWKS = createRemoteJWKSet(
  new URL(`${config.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);
