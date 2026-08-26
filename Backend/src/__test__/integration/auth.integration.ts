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

// Rather than seeding the DB with a pre-hashed password, the happy-path
// login tests go through the real /register endpoint first and exercise
// /login against the account that was actually created. The only
// exception is the "inactive user" case, which registers via the API
// and then flips isActive directly in the DB (no deactivation endpoint
// was shown).
//
// NOTE on casing: in schema.ts, only `userName` got an explicit db name
// ("user_name"). Every other camelCase column (isActive, isVerified,
// createdAt, updatedAt...) has no explicit name, so Drizzle creates the
// literal camelCase identifier and Postgres folds it to lowercase unless
// quoted. That's why the raw SQL below uses "isActive" in double quotes.

const VALID_USER = {
  userName: "bipin_test",
  name: "Bipin Test",
  email: "bipin.test@example.com",
  password: "SuperSecret123!",
};

const REGISTER_PATH = "/api/v1/auth/register";
const LOGIN_PATH = "/api/v1/auth/login";

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
