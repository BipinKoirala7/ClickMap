import { config } from "@/config/index.ts";
import * as jose from "jose";

const ACCESS_TOKEN_TYPE = "ACCESS_TOKEN";
const REFRESH_TOKEN_TYPE = "REFRESH_TOKEN";
const secret = new TextEncoder().encode(config.JWT_SECRET);

async function createAccessToken(userId: string): Promise<string> {
  const payload = {
    tokenType: ACCESS_TOKEN_TYPE,
  };

  const options = {
    expiresIn: "15m",
  };

  const accessToken = await new jose.SignJWT(payload)
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(new Date())
    .setExpirationTime(options.expiresIn)
    .sign(secret);

  return accessToken;
}

async function createRefreshToken(userId: string): Promise<string> {
  const payload = {
    tokenType: REFRESH_TOKEN_TYPE,
  };

  const options = {
    expiresIn: "7d",
  };

  const refreshToken = await new jose.SignJWT(payload)
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(new Date())
    .setExpirationTime(options.expiresIn)
    .sign(secret);

  return refreshToken;
}

export const jwtService = {
  createAccessToken,
  createRefreshToken,
};
