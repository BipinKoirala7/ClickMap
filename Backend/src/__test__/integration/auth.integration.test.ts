import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  startTestDb,
  stopTestDb,
  clearTestDb,
  getTestDb,
} from "@/__test__/testdb.ts";
import { buildTestApp } from "@/__test__/testApp";

const VALID_USER = {
  userName: "bipin_test",
  name: "Bipin Test",
  email: "bipin.test@example.com",
  password: "SuperSecret123!",
};

const REGISTER_PATH = "/api/v1/auth/register";
const LOGIN_PATH = "/api/v1/auth/login";
const REFRESH_PATH = "/api/v1/auth/refresh";
const LOGOUT_PATH = "/api/v1/auth/logout";
const ACTIVATE_PATH = "/api/v1/auth/activate";
const DEACTIVATE_PATH = "/api/v1/auth/deactivate";

let app: Express;

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

describe("POST /auth/register", () => {
  it("registers a new user and returns 200 with no data payload", async () => {
    const res = await request(app).post(REGISTER_PATH).send(VALID_USER);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Registered",
      data: null,
    });
  });

  it("rejects an invalid payload with 422", async () => {
    const res = await request(app)
      .post(REGISTER_PATH)
      .send({ userName: "no_email_or_password" });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("rejects a duplicate email with a 4xx (not a raw 500)", async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);

    const res = await request(app).post(REGISTER_PATH).send(VALID_USER);

    // registerUser() has no explicit duplicate check before
    // userRepository.createUser() — it relies on that call throwing. The
    // users.email column has a unique constraint, so Postgres will raise
    // a 23505 unique-violation on the second insert. Unless
    // userRepository.createUser catches that and rethrows
    // UserAlreadyExistsError, this falls through errorHandler's
    // catch-all and comes back as a 500 instead of a 400. This test
    // pins the desired behavior — a 500 here means the repository needs
    // that catch, not that the test is wrong.
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);
  });

  it("logs in with valid credentials, returns 200 and sets auth cookies", async () => {
    const res = await request(app).post(LOGIN_PATH).send({
      email: VALID_USER.email,
      password: VALID_USER.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Logged In",
      data: null,
    });

    const setCookie = res.headers["set-cookie"] ?? [];
    const cookieString = Array.isArray(setCookie)
      ? setCookie.join(";")
      : setCookie;
    expect(cookieString).toMatch(/refreshToken/i);
    expect(cookieString).toMatch(/accessToken/i);
  });

  it("rejects an unknown email with 401 and a generic message", async () => {
    const res = await request(app).post(LOGIN_PATH).send({
      email: "nobody@example.com",
      password: VALID_USER.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects an incorrect password with 401 and a generic message", async () => {
    const res = await request(app).post(LOGIN_PATH).send({
      email: VALID_USER.email,
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects login for a deactivated account with 401", async () => {
    const db = getTestDb();
    await db.execute(
      `UPDATE "users" SET "isActive" = false WHERE email = '${VALID_USER.email}'`,
    );

    const res = await request(app).post(LOGIN_PATH).send({
      email: VALID_USER.email,
      password: VALID_USER.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User account is deactivated");
  });

  it("rejects an invalid payload with 422", async () => {
    const res = await request(app)
      .post(LOGIN_PATH)
      .send({ email: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /auth/refresh", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);
  });

  it("issues a new access + refresh token pair for a valid, active refresh token", async () => {
    const { refreshToken: oldRefreshToken } = await loginAndGetCookies();

    const res = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${oldRefreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Token Refreshed",
      data: null,
    });

    const setCookie = (res.headers["set-cookie"] ?? []) as string[];
    const cookieString = setCookie.join(";");
    expect(cookieString).toMatch(/refreshToken/i);
    expect(cookieString).toMatch(/accessToken/i);

    // Rotation: the new refresh token should differ from the old one
    const newRefreshToken = extractCookieValue(setCookie, "refreshToken");
    expect(newRefreshToken).toBeDefined();
    expect(newRefreshToken).not.toBe(oldRefreshToken);
  });

  it("returns 401 when no refresh token cookie is sent", async () => {
    const res = await request(app).post(REFRESH_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 for a malformed/invalid refresh token", async () => {
    const res = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", ["refreshToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expired, Please Log in again");
  });

  it("returns 401 when reusing a refresh token that was already rotated out", async () => {
    const { refreshToken: firstRefreshToken } = await loginAndGetCookies();

    // Use it once — this rotates the stored active refresh token.
    await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${firstRefreshToken}`])
      .expect(200);

    // Reusing the same (now stale) refresh token should fail, since
    // setActiveRefreshToken's onConflictDoUpdate keyed on userId means
    // only the newest refresh token is considered active.
    const res = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${firstRefreshToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token is not active");
  });

  it("lets the newly issued refresh token be used for a subsequent refresh", async () => {
    const { refreshToken: firstRefreshToken } = await loginAndGetCookies();

    const firstRefreshRes = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${firstRefreshToken}`])
      .expect(200);

    const rotatedRefreshToken = extractCookieValue(
      (firstRefreshRes.headers["set-cookie"] ?? []) as string[],
      "refreshToken",
    );
    expect(rotatedRefreshToken).toBeDefined();

    const secondRefreshRes = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${rotatedRefreshToken}`]);

    expect(secondRefreshRes.status).toBe(200);
    expect(secondRefreshRes.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Token Refreshed",
    });
  });
});

describe("POST /auth/logout", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);
  });

  it("logs out a valid session: 200, clears cookies, and invalidates the refresh token", async () => {
    const { refreshToken } = await loginAndGetCookies();

    const res = await request(app)
      .post(LOGOUT_PATH)
      .set("Cookie", [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Logged Out",
      data: null,
    });

    // clearCookiesInResponse should have touched both cookies
    const setCookie = (res.headers["set-cookie"] ?? []) as string[];
    const cookieString = setCookie.join(";");
    expect(cookieString).toMatch(/refreshToken/i);
    expect(cookieString).toMatch(/accessToken/i);

    // Functional proof of invalidation: authRepository.deleteActiveRefreshToken
    // removed the row, so rotateActiveRefreshToken's lookup on a subsequent
    // /refresh call finds nothing and throws "Refresh token is not active",
    // even though the JWT itself is still cryptographically valid.
    const refreshAfterLogout = await request(app)
      .post(REFRESH_PATH)
      .set("Cookie", [`refreshToken=${refreshToken}`]);

    expect(refreshAfterLogout.status).toBe(401);
    expect(refreshAfterLogout.body.message).toBe("Refresh token is not active");
  });

  it("returns 401 when no refresh token cookie is sent", async () => {
    const res = await request(app).post(LOGOUT_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 when only the access token cookie is sent (no refresh cookie)", async () => {
    const { accessToken } = await loginAndGetCookies();

    const res = await request(app)
      .post(LOGOUT_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    // authenticateRefreshToken only ever looks at the refresh cookie via
    // cookiesService.getRefreshCookiesFromRequest, so an access-token-only
    // request is indistinguishable from "no token at all" here.
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 for a malformed/invalid refresh token", async () => {
    const res = await request(app)
      .post(LOGOUT_PATH)
      .set("Cookie", ["refreshToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    // Mirrors the equivalent /refresh test's expectation for the same
    // malformed-token input hitting jwtService.verifyRefreshToken.
    expect(res.body.message).toBe("User Session expired, Please Log in again");
  });

  it("logging out twice with the same still-valid JWT succeeds both times (idempotent)", async () => {
    const { refreshToken } = await loginAndGetCookies();

    await request(app)
      .post(LOGOUT_PATH)
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(200);

    // authService.logout() has no "is this token still active" check before
    // deleting — it just calls deleteActiveRefreshToken(req.userId), which is
    // a no-op if the row is already gone. As long as the JWT itself hasn't
    // expired, authenticateRefreshToken lets a second logout through too.
    // This pins that (arguably loose) behavior rather than assuming it.
    const res = await request(app)
      .post(LOGOUT_PATH)
      .set("Cookie", [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User Logged Out");
  });
});

describe("POST /auth/activate", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);
  });

  it("activates a deactivated user and returns 200", async () => {
    const { accessToken } = await loginAndGetCookies();

    // Deactivate directly in the DB so there's something for the endpoint to do
    const db = getTestDb();
    await db.execute(
      `UPDATE "users" SET "isActive" = false WHERE email = '${VALID_USER.email}'`,
    );

    const res = await request(app)
      .post(ACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Account Activated",
      data: null,
    });

    const rows = await db.execute(
      `SELECT "isActive" FROM "users" WHERE email = '${VALID_USER.email}'`,
    );
    expect(rows.rows[0]!.isActive).toBe(true);
  });

  it("returns a conflict error when the user is already active", async () => {
    const { accessToken } = await loginAndGetCookies();
    // A freshly registered user is active by default — no setup needed.

    const res = await request(app)
      .post(ACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User is already active");
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).post(ACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for a malformed/invalid access token", async () => {
    const res = await request(app)
      .post(ACTIVATE_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).post(ACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });
});

describe("POST /auth/deactivate", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(200);
  });

  it("deactivates an active user and returns 200", async () => {
    const { accessToken } = await loginAndGetCookies();

    const res = await request(app)
      .post(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Account DeActivated",
      data: null,
    });

    const db = getTestDb();
    const rows = await db.execute(
      `SELECT "isActive" FROM "users" WHERE email = '${VALID_USER.email}'`,
    );
    expect(rows.rows[0]!.isActive).toBe(false);
  });

  it("returns a conflict error when the user is already deactivated", async () => {
    const { accessToken } = await loginAndGetCookies();

    await request(app)
      .post(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    const res = await request(app)
      .post(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User is already deactivated");
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).post(DEACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for a malformed/invalid access token", async () => {
    const res = await request(app)
      .post(DEACTIVATE_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).post(DEACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });
});
