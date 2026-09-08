import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "@/app";
import { userService } from "@/modules/user/user.service";
import type { PublicUserDto } from "@/modules/user/user.schema";
import { jwtService } from "@/modules/auth/jwt.service";
import type { User } from "@/modules/auth/auth.schema";
import type TestAgent from "supertest/lib/agent";
import { UserNotFoundError } from "@/errors/Errors";
import { ZodError } from "zod";
import { cookiesService } from "@/modules/auth/cookies.service";
import {
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
  JWTExpired,
  JWTInvalid,
} from "jose/errors";

const user: PublicUserDto = {
  name: "Bipin Koirala",
  userName: "bipin123",
  email: "bipinkoirala2061@gmail.com",
  plan: "free",
  isActive: false,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/modules/user/user.service.ts");
vi.mock("@/modules/auth/jwt.service.ts");
vi.mock("@/modules/auth/cookies.service.ts");
vi.mock("@/modules/user/user.repository.ts");

const userServiceMock = vi.mocked(userService);

let server: TestAgent;

beforeAll(() => {
  server = request(app);
});

const GET_USER_URL = "/api/v1/user/";

describe("GET /users/", () => {
  it("returns 200 and the public user payload", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    vi.mocked(userServiceMock.getUserById).mockResolvedValue(user as User);

    const res = await request(app)
      .get(GET_USER_URL)
      .set("Cookie", ["accessToken=valid.jwt.token"]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Info Successfully Fetched",
    });
    expect(res.body.data).toMatchObject({
      name: "Bipin Koirala",
      userName: "bipin123",
      email: "bipinkoirala2061@gmail.com",
    });
    expect(jwtService.verifyAccessToken).toHaveBeenCalledWith(
      "valid.jwt.token",
    );
    expect(userServiceMock.getUserById).toHaveBeenCalledWith("user-123");
  });

  // --- Token errors ----------------------------------------------------------

  it("returns 401 when no access token cookie is present", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(null);

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: "User is not logged In",
    });
    // Confirms the middleware short-circuits before doing any real work.
    expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
    expect(userServiceMock.getUserById).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token cookie is an empty string", async () => {
    // `!accessToken` is also true for "", so this is a distinct branch from
    // "cookie missing entirely" — worth its own test since a falsy-but-present
    // value is a common source of bugs.
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue("");
    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
    expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token is expired", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "expired.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTExpired('"exp" claim timestamp check failed', {}),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expired, Please Log in again");
    expect(userServiceMock.getUserById).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token is malformed", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "not-a-jwt",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTInvalid("Invalid Compact JWS"),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
  });

  it("returns 401 when the access token signature verification fails", async () => {
    // Extra case beyond the original list: a token that parses but was
    // signed with the wrong key / has been tampered with. This exercises
    // the JWSSignatureVerificationFailed branch in errorHandler, which is
    // otherwise never hit by the "expired" or "malformed" tests.
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "tampered.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWSSignatureVerificationFailed("signature verification failed"),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
  });

  it("returns 401 when a token claim fails validation", async () => {
    // Extra case: e.g. wrong audience/issuer. Distinct from JWTExpired even
    // though both extend JWTClaimValidationFailed in jose — expired has its
    // own subclass and its own branch in errorHandler, so it needs separate
    // coverage from a generic claim failure like a bad `aud`.
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "wrong-audience.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTClaimValidationFailed(
        'unexpected "aud" claim value',
        {},
        "aud",
        "check_failed",
      ),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
  });

  // --- Downstream errors -----------------------------------------------------

  it("returns 404 when the authenticated user no longer exists", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("ghost-user");
    vi.mocked(userServiceMock.getUserById).mockRejectedValue(
      new UserNotFoundError(),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User Not Found");
  });

  it("returns 422 when the stored record fails schema validation", async () => {
    // Adjust the malformed shape below to match a field your real
    // publicUserSchema actually requires, so `.parse()` genuinely throws.
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    vi.mocked(userServiceMock.getUserById).mockRejectedValue(
      new ZodError([
        {
          code: "invalid_type",
          path: ["name"],
          message: "Expected string, received number",
          expected: "string",
        },
      ]),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Please sent valid information");
  });

  it("returns 500 when an unexpected error is thrown downstream", async () => {
    // Extra case: guards the fallback branch in errorHandler so a raw,
    // unclassified error (e.g. a DB connection failure) never leaks
    // internals and always degrades to a generic 500.
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    userServiceMock.getUserById.mockRejectedValue(
      new Error("connection reset"),
    );

    const res = await request(app).get(GET_USER_URL);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Unexpected Error Occured");
  });
});

describe("PUT /user Request", () => {
  const UPDATE_USER_URL = "/api/v1/user/";
  const validUpdateBody = {
    name: "BipinKoirala",
    userName: "bipin.koirala.123",
  };

  it("returns 200 when token and update body is valid", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    vi.mocked(userServiceMock.updateUser).mockResolvedValue(undefined);

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=valid.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: "User Info Updated",
    });
    expect(userServiceMock.updateUser).toHaveBeenCalledWith(
      "user-123",
      validUpdateBody,
    );
  });

  // --- Token errors ----------------------------------------------------------

  it("returns 401 when no access token cookie is present", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(null);

    const res = await request(app).put(UPDATE_USER_URL).send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: "User is not logged In",
    });
    expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token cookie is an empty string", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue("");

    const res = await request(app).put(UPDATE_USER_URL).send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
    expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token is expired", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "expired.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTExpired('"exp" claim timestamp check failed', {}),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=expired.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expired, Please Log in again");
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token is malformed/invalid", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "not-a-jwt",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTInvalid("Invalid Compact JWS"),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=not-a-jwt"])
      .send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it("returns 401 when the access token signature verification fails", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "tampered.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWSSignatureVerificationFailed("signature verification failed"),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=tampered.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it("returns 401 when a token claim fails validation", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "wrong-audience.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new JWTClaimValidationFailed(
        'unexpected "aud" claim value',
        {},
        "aud",
        "check_failed",
      ),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=wrong-audience.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expred, Please Log in again");
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  // --- Downstream errors -----------------------------------------------------

  it("returns 404 when the authenticated user no longer exists", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("ghost-user");
    vi.mocked(userServiceMock.updateUser).mockRejectedValue(
      new UserNotFoundError(),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=valid.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User Not Found");
  });

  it("returns 422 when the update body fails schema validation", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    vi.mocked(userServiceMock.updateUser).mockRejectedValue(
      new ZodError([
        {
          code: "invalid_type",
          path: ["userName"],
          message: "Expected string, received null",
          expected: "string",
        },
      ]),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=valid.jwt.token"])
      .send({ name: "BipinKoirala", userName: null });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Please sent valid information");
  });

  it("returns 500 when an unexpected error is thrown downstream", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "valid.jwt.token",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    vi.mocked(userServiceMock.updateUser).mockRejectedValue(
      new Error("connection reset"),
    );

    const res = await request(app)
      .put(UPDATE_USER_URL)
      .set("Cookie", ["accessToken=valid.jwt.token"])
      .send(validUpdateBody);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Unexpected Error Occured");
  });
});
