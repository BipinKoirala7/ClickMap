import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { clearTestDb, startTestDb, stopTestDb } from "../testdb";
import { buildTestApp } from "../testApp";
const VALID_USER = {
  userName: "bipin_test",
  name: "Bipin Test",
  email: "bipin.test@example.com",
  password: "SuperSecret123!",
};

let app: Express;

const LOGIN_PATH = "/api/v1/auth/login";
const GET_USER_PATH = "/api/v1/user";
const SIGNUP_PATH = "/api/v1/auth/register";

beforeAll(async () => {
  await startTestDb();
  app = await buildTestApp();
}, 60_000);

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

function extractCookieValue(
  setCookieHeader: string[] | undefined,
  cookieName: string,
): string | undefined {
  const raw = setCookieHeader?.find((c) => c.startsWith(`${cookieName}=`));
  return raw?.split(";")[0]?.split("=")[1];
}

/**
 * Registers a user through the real signup endpoint (so password hashing,
 * defaults, etc. all go through production code, not a DB shortcut).
 */
export async function registerTestUser() {
  const res = await request(app).post(SIGNUP_PATH).send(VALID_USER);

  if (res.status >= 400) {
    throw new Error(
      `Signup failed with ${res.status} in a test helper — check SIGNUP_PATH/payload shape: ${JSON.stringify(res.body)}`,
    );
  }
}

async function loginAndGetCookies() {
  const loginRes = await request(app).post(LOGIN_PATH).send({
    email: VALID_USER.email,
    password: VALID_USER.password,
  });

  const setCookie = (loginRes.headers["set-cookie"] ?? []) as string[];
  const refreshToken = extractCookieValue(setCookie, "refreshToken");
  const accessToken = extractCookieValue(setCookie, "accessToken");

  if (!refreshToken || !accessToken) {
    throw new Error(
      "Login did not return the expected auth cookies — check LOGIN_PATH test above",
    );
  }

  return { refreshToken, accessToken, setCookie };
}

describe("GET /api/v1/users/", () => {
  it("returns the logged-in user's public profile, stripped of sensitive columns", async () => {
    await registerTestUser();
    const { setCookie } = await loginAndGetCookies();

    const res = await request(app).get(GET_USER_PATH).set("Cookie", setCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Info Successfully Fetched");

    // This is the assertion a slice test cannot give you for free: it
    // proves the real drizzle-zod publicUserSchema.omit({ id, password })
    // actually strips those columns off a row that came back from real
    // Postgres, and that column defaults (plan/isActive/isVerified) are
    // what the schema declares.
    expect(res.body.data).toMatchObject({
      email: VALID_USER.email,
      name: VALID_USER.name,
      userName: VALID_USER.userName,
      plan: "free",
      isActive: true,
      isVerified: false,
    });
    expect(res.body.data).not.toHaveProperty("id");
    expect(res.body.data).not.toHaveProperty("password");
    expect(res.body.data).toHaveProperty("createdAt");
    expect(res.body.data).toHaveProperty("updatedAt");
  });

  it("returns 401 when no auth cookies are sent", async () => {
    const res = await request(app).get(GET_USER_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 when the access token cookie is garbage", async () => {
    const res = await request(app)
      .get(GET_USER_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/session|log in/i);
  });

  it("returns 401 when the access token cookie has been tampered with", async () => {
    await registerTestUser();
    const { accessToken } = await loginAndGetCookies();

    // Flip the last character so the signature no longer verifies, without
    // needing to hand-craft a JWT ourselves.
    const lastChar = accessToken.at(-1);
    const tampered = accessToken.slice(0, -1) + (lastChar === "a" ? "b" : "a");

    const res = await request(app)
      .get(GET_USER_PATH)
      .set("Cookie", [`accessToken=${tampered}`]);

    expect(res.status).toBe(401);
  });

  // Deliberately left out: an "expired token" integration test. Doing this
  // properly needs either a configurable, short access-token TTL for the
  // test environment (e.g. an ACCESS_TOKEN_TTL env var the jwtService
  // reads) so the test can actually wait it out, or faking the clock in a
  // way that plays nicely with supertest's real HTTP calls — neither of
  // which I can assume from what's shown here. The slice test already
  // covers the errorHandler branch for JWTExpired directly; this would
  // only add "the real jwtService really does throw JWTExpired for a
  // really-expired token," which is closer to a jwtService unit test than
  // a route integration test.
});
