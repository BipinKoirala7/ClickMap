import { config } from "@/config/index.ts";
import { AuthenticationError } from "@/errors/Errors.ts";
import * as jose from "jose";
import type { User } from "./auth.schema.ts";
import { nanoid } from "nanoid";

const ACCESS_TOKEN_TYPE = "ACCESS_TOKEN";
const REFRESH_TOKEN_TYPE = "REFRESH_TOKEN";
const secret = new TextEncoder().encode(config.JWT_SECRET);

async function createAccessToken(user: User): Promise<string> {
  const payload = {
    email: user.email,
    tokenType: ACCESS_TOKEN_TYPE,
  };

  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpirationTime =
    now + Math.floor(config.ACCESS_TOKEN_EXPIRATION / 1000);

  const accessToken = await new jose.SignJWT(payload)
    .setSubject(user.id)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(new Date())
    .setJti(nanoid())
    .setExpirationTime(accessTokenExpirationTime)
    .sign(secret);

  return accessToken;
}

async function createRefreshToken(userId: string): Promise<string> {
  const payload = {
    tokenType: REFRESH_TOKEN_TYPE,
  };

  const now = Math.floor(Date.now() / 1000);
  const refreshTokenExpirationSeconds =
    now + Math.floor(config.REFRESH_TOKEN_EXPIRATION / 1000);

  const refreshToken = await new jose.SignJWT(payload)
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(new Date())
    .setJti(nanoid())
    .setExpirationTime(refreshTokenExpirationSeconds)
    .sign(secret);

  return refreshToken;
}

async function verifyAccessToken(accessToken: string): Promise<string> {
  const { payload } = await jose.jwtVerify(accessToken, secret);

  if (payload.tokenType !== ACCESS_TOKEN_TYPE) {
    throw new AuthenticationError();
  }

  if (payload.sub == undefined) {
    throw new AuthenticationError();
  }

  return payload.sub;
}

async function verifyRefreshToken(refreshToken: string): Promise<string> {
  const { payload } = await jose.jwtVerify(refreshToken, secret);

  if (payload.tokenType !== REFRESH_TOKEN_TYPE) {
    throw new AuthenticationError();
  }

  if (payload.sub == undefined) {
    throw new AuthenticationError();
  }

  return payload.sub;
}

export const jwtService = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
