import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  clearTestDb,
  getTestDb,
  startTestDb,
  stopTestDb,
} from "@/__test__/testdb";
import { buildTestApp } from "@/__test__/testApp";

const VALID_USER = {
  userName: "bipin_test",
  name: "Bipin Test",
  email: "bipin.test@example.com",
  password: "SuperSecret123!",
};

let app: Express;

const REGISTER_PATH = "/api/v1/auth/register";
const LOGIN_PATH = "/api/v1/auth/login";
const GET_USER_PATH = "/api/v1/user/me";
const UPDATE_USER_PATH = "/api/v1/user";
const ACTIVATE_PATH = "/api/v1/user/activate";
const DEACTIVATE_PATH = "/api/v1/user/deactivate";

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
  const res = await request(app).post(REGISTER_PATH).send(VALID_USER);

  if (res.status >= 400) {
    throw new Error(
      `Signup failed with ${res.status} in a test helper — check REGISTER_PATH/payload shape: ${JSON.stringify(res.body)}`,
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
  it("updates the user and returns 200", async () => {
    await registerTestUser();
    const { setCookie } = await loginAndGetCookies();

    const res = await request(app)
      .put(UPDATE_USER_PATH)
      .set("Cookie", setCookie)
      .send({ name: "Updated Name", userName: "bipin_updated" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Info Updated",
    });

    // The route itself returns `data: null`, so the only way to prove the
    // write actually landed in Postgres (rather than just returning 200
    // regardless) is to read it back through the GET endpoint.
    const verifyRes = await request(app)
      .get(GET_USER_PATH)
      .set("Cookie", setCookie);

    expect(verifyRes.body.data).toMatchObject({
      name: "Updated Name",
      userName: "bipin_updated",
    });
  });

  it("returns 401 when no auth cookies are sent", async () => {
    const res = await request(app)
      .put(UPDATE_USER_PATH)
      .send({ name: "Someone Else" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 when the access token cookie is garbage", async () => {
    const res = await request(app)
      .put(UPDATE_USER_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"])
      .send({ name: "Someone Else" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/session|log in/i);
  });

  it("returns 401 when the access token cookie has been tampered with", async () => {
    await registerTestUser();
    const { accessToken } = await loginAndGetCookies();

    const lastChar = accessToken.at(-1);
    const tampered = accessToken.slice(0, -1) + (lastChar === "a" ? "b" : "a");

    const res = await request(app)
      .put(UPDATE_USER_PATH)
      .set("Cookie", [`accessToken=${tampered}`])
      .send({ name: "Someone Else" });

    expect(res.status).toBe(401);
  });

  it("returns 422 when the update body fails schema validation", async () => {
    await registerTestUser();
    const { setCookie } = await loginAndGetCookies();

    const res = await request(app)
      .put(UPDATE_USER_PATH)
      .set("Cookie", setCookie)
      .send({ userName: 12345 }); // wrong type, should fail updateUserSchema.parse

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Please sent valid information");
  });
});

describe("POST /auth/activate", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(201);
  });

  it("activates a deactivated user and returns 200", async () => {
    const { accessToken } = await loginAndGetCookies();

    // Deactivate directly in the DB so there's something for the endpoint to do
    const db = getTestDb();
    await db.execute(
      `UPDATE "users" SET "isActive" = false WHERE email = '${VALID_USER.email}'`,
    );

    const res = await request(app)
      .patch(ACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Activated",
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
      .patch(ACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User is already active");
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).patch(ACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for a malformed/invalid access token", async () => {
    const res = await request(app)
      .patch(ACTIVATE_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).patch(ACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });
});

describe("POST /auth/deactivate", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_PATH).send(VALID_USER).expect(201);
  });

  it("deactivates an active user and returns 200", async () => {
    const { accessToken } = await loginAndGetCookies();

    const res = await request(app)
      .patch(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Deactivated",
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
      .patch(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    const res = await request(app)
      .patch(DEACTIVATE_PATH)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User is already deactivated");
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).patch(DEACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for a malformed/invalid access token", async () => {
    const res = await request(app)
      .patch(DEACTIVATE_PATH)
      .set("Cookie", ["accessToken=not-a-real-jwt"]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when no access token cookie is sent", async () => {
    const res = await request(app).patch(DEACTIVATE_PATH);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });
});
