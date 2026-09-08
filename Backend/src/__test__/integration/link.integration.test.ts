import type { Express } from "express";
import * as jose from "jose";
import { clearTestDb, startTestDb, stopTestDb } from "../testdb";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp } from "../testApp";
import type { CreateLinkDto } from "@/modules/links/links.schema";

let server: Express;

const SIGNUP_PATH = "/api/v1/auth/register";
const LOGIN_PATH = "/api/v1/auth/login";
const LINK_CREATE_PATH = "/api/v1/link";

const VALID_USER = {
  userName: "bipin_test",
  name: "Bipin Test",
  email: "bipin.test@example.com",
  password: "SuperSecret123!",
};

const VALID_LINK_PAYLOAD: CreateLinkDto = {
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "Example Link",
};

const ACCESS_TOKEN_TYPE = "ACCESS_TOKEN";

let jwtService: (typeof import("@/modules/auth/jwt.service"))["jwtService"];
let config: (typeof import("@/config"))["config"];

beforeAll(async () => {
  await startTestDb();
  ({ jwtService } = await import("@/modules/auth/jwt.service"));
  ({ config } = await import("@/config"));
  server = await buildTestApp();
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
  const res = await request(server).post(SIGNUP_PATH).send(VALID_USER);

  if (res.status >= 400) {
    throw new Error(
      `Signup failed with ${res.status} in a test helper — check SIGNUP_PATH/payload shape: ${JSON.stringify(res.body)}`,
    );
  }
}

async function loginAndGetCookies() {
  const loginRes = await request(server).post(LOGIN_PATH).send({
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

/**
 * Builds a raw access-token-shaped JWT signed with the app's real secret,
 * bypassing jwtService.createAccessToken (which requires a full `User`
 * object we don't have a fixture for). This mirrors exactly what
 * verifyAccessToken checks: alg, tokenType claim, sub, exp — so it's a
 * faithful way to hit specific failure branches without needing to know
 * the shape of `User`.
 */
async function buildRawAccessToken(options: {
  sub?: string;
  tokenType?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const { tokenType = ACCESS_TOKEN_TYPE, expiresInSeconds = 15 * 60 } = options;

  const secret = new TextEncoder().encode(config.JWT_SECRET);
  const now = Math.floor(Date.now() / 1000);

  let signer = new jose.SignJWT({ tokenType })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds);

  if ("sub" in options) {
    if (options.sub !== undefined) {
      signer = signer.setSubject(options.sub);
    }
    // else: options.sub === undefined but key present → explicit opt-out, no subject set
  } else {
    signer = signer.setSubject("some-user-id"); // default when caller doesn't mention sub at all
  }

  return signer.sign(secret);
}

/**
 * Corrupts the signature segment of a JWT (the part after the last `.`)
 * so `jose` throws JWSSignatureVerificationFailed rather than JWTInvalid.
 */
function tamperSignature(token: string): string {
  const parts = token.split(".");
  const sig = parts[2] ?? "";
  const flipped =
    sig.slice(0, -4) + (sig.slice(-4) === "aaaa" ? "bbbb" : "aaaa");
  return [parts[0], parts[1], flipped].join(".");
}

describe("Link Creation Integration Test", () => {
  it("should create a link successfully", async () => {
    await registerTestUser();
    const { setCookie } = await loginAndGetCookies();

    const res = await request(server)
      .post(LINK_CREATE_PATH)
      .set("Cookie", setCookie)
      .send(VALID_LINK_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
  });

  // ---------------------------------------------------------------------
  // Missing token — cookiesService.getAccessCookiesFromRequest returns
  // null/"" and authenticate's `if (!accessToken)` throws MissingTokenError
  // -> errorHandler's AppError branch -> 401
  // ---------------------------------------------------------------------
  describe("when no access token is present", () => {
    it("returns 401 when no cookie is sent at all", async () => {
      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not logged in/i);
    });

    it("returns 401 when accessToken cookie is present but empty", async () => {
      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken="])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
    });

    it("returns 401 when only an unrelated cookie is present", async () => {
      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["someOtherCookie=value"])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------
  // jose-level verification failures. These are NOT AppError instances,
  // so they hit errorHandler's `instanceof JOSEError` branch instead —
  // note the message is "...session expired..." for all sub-cases,
  // including malformed tokens, per the current errorHandler code.
  // ---------------------------------------------------------------------
  describe("when the access token fails jose verification", () => {
    it("returns 401 with a non-JWT string (JWTInvalid)", async () => {
      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=this-is-not-a-jwt"])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/log in again/i);
    });

    it("returns 401 with a tampered signature (JWSSignatureVerificationFailed)", async () => {
      const validToken = await buildRawAccessToken({});
      const tampered = tamperSignature(validToken);

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${tampered}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/log in again/i);
    });

    it("returns 401 with an expired token (JWTExpired)", async () => {
      const expiredToken = await buildRawAccessToken({
        sub: "some-user-id",
        expiresInSeconds: -60, // already expired 60s ago
      });

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${expiredToken}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/session expired/i);
    });

    // NOTE: verifyAccessToken calls jose.jwtVerify(token, secret) with no
    // `issuer`/`audience` options, and createAccessToken never sets an iss
    // or aud claim. So JWTClaimValidationFailed cannot currently be
    // triggered by this code path — there's nothing to mismatch. Leaving
    // this documented rather than testing a branch that's unreachable
    // given the current implementation. If iss/aud validation is added
    // later, this is where that test would go.
  });

  // ---------------------------------------------------------------------
  // Token verifies via jose fine, but verifyAccessToken's own manual
  // checks reject it -> throws AuthenticationError (an AppError) ->
  // errorHandler's AppError branch -> 401 "User is not logged In"
  // ---------------------------------------------------------------------
  describe("when the token is well-signed but semantically invalid", () => {
    it("returns 401 when a refresh token is sent as the access token (wrong tokenType)", async () => {
      // Uses the real service so this stays true to production signing,
      // rather than hand-rolling the wrong-type case.
      const refreshToken = await jwtService.createRefreshToken("user123");

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${refreshToken}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/not logged in/i);
    });

    it("returns 401 when the token has no subject claim", async () => {
      const noSubToken = await buildRawAccessToken({ sub: null as unknown as string });

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${noSubToken}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/not logged in/i);
    });
  });

  // ---------------------------------------------------------------------
  // Middleware passes (sub is defined and well-typed), but the resolved
  // userId is invalid downstream, in createLink's own guard or in
  // userService.getById.
  // ---------------------------------------------------------------------
  describe("when the token's subject doesn't correspond to a valid user", () => {
    it("returns 404 when the subject is a well-formed but nonexistent user id", async () => {
      const bogusUserId = "00000000-0000-0000-0000-000000000000";
      const forgedToken = await buildRawAccessToken({ sub: bogusUserId });

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${forgedToken}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/user not found/i);
    });

    it("returns 401 when the subject is an empty string", async () => {
      // ASSUMPTION: jose's SignJWT.setSubject("") does not itself throw
      // and simply sets `sub: ""` on the payload. If that assumption is
      // wrong, this test needs to construct the payload manually instead
      // of going through setSubject.
      const emptySubToken = await buildRawAccessToken({ sub: "" });

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", [`accessToken=${emptySubToken}`])
        .send(VALID_LINK_PAYLOAD);

      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------
  // Schema validation (ZodError -> errorHandler's ZodError branch -> 422)
  // ---------------------------------------------------------------------
  describe("when the payload fails schema validation", () => {
    it("returns 422 when originalUrl is missing", async () => {
      await registerTestUser();
      const { setCookie } = await loginAndGetCookies();

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", setCookie)
        .send({ shortCode: "abc123", title: "Example Link" });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid information/i);
    });

    it("returns 422 when originalUrl is not a valid URL", async () => {
      await registerTestUser();
      const { setCookie } = await loginAndGetCookies();

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", setCookie)
        .send({ ...VALID_LINK_PAYLOAD, originalUrl: "not-a-url" });

      expect(res.status).toBe(422);
    });

    it("returns 422 when the body is empty", async () => {
      await registerTestUser();
      const { setCookie } = await loginAndGetCookies();

      const res = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", setCookie)
        .send({});

      expect(res.status).toBe(422);
    });
  });

  // ---------------------------------------------------------------------
  // Persistence conflict — status depends on whether links.repository (or
  // a layer above it) translates the DB's unique-constraint violation
  // into an AppError. I don't have that file, so this stays loose; if it
  // currently falls through to errorHandler's generic 500 branch, that's
  // worth tightening into a real 409 rather than leaving unhandled.
  // ---------------------------------------------------------------------
  describe("when creating a link with a duplicate shortCode", () => {
    it("does not silently succeed twice with the same shortCode", async () => {
      await registerTestUser();
      const { setCookie } = await loginAndGetCookies();

      const first = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", setCookie)
        .send(VALID_LINK_PAYLOAD);
      expect(first.status).toBe(201);

      const second = await request(server)
        .post(LINK_CREATE_PATH)
        .set("Cookie", setCookie)
        .send(VALID_LINK_PAYLOAD);

      expect(second.status).not.toBe(201);
      expect([409, 400, 500]).toContain(second.status);
    });
  });
});
