import { config } from "@/config/index.ts";
import { AuthenticationError } from "@/errors/Errors.ts";
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

async function verifyAccessToken(accessToken: string): Promise<string> {
  const { payload } = await jose.jwtDecrypt(accessToken, secret);

  if (payload.tokenType !== ACCESS_TOKEN_TYPE) {
    throw new AuthenticationError();
  }

  if (payload.sub == undefined) {
    throw new AuthenticationError();
  }

  return payload.sub;
}

async function verifyRefreshToken(refreshToken: string): Promise<string> {
  const { payload } = await jose.jwtDecrypt(refreshToken, secret);

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
