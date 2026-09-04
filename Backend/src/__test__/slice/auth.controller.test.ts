import app from "@/app";
import type { RegisterUserDto } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { ZodError } from "zod";
import request from "supertest";
import type TestAgent from "supertest/lib/agent";
import { describe, expect, it, beforeAll, vi, beforeEach } from "vitest";
import AppError from "@/errors/AppError";
import {
  AuthenticationError,
  UserAlreadyActiveError,
  UserAlreadyDeactivatedError,
  UserNotFoundError,
} from "@/errors/Errors";
import {
  JWSSignatureVerificationFailed,
  JWTExpired,
  JWTInvalid,
} from "jose/errors";
import { cookiesService } from "@/modules/auth/cookies.service";
import { jwtService } from "@/modules/auth/jwt.service";
import type { QueryResult } from "node_modules/@types/pg";

vi.mock("@/modules/auth/auth.service.ts");
vi.mock("@/modules/auth/jwt.service.ts");
vi.mock("@/modules/auth/auth.repository.ts");
vi.mock("@/modules/auth/cookies.service.ts");
vi.mock("@/modules/user/user.service.ts");

const newUser: RegisterUserDto = {
  name: "Bipin Koirala",
  userName: "bipin123",
  email: "bipin@gmail.com",
  password: "password123",
};

const authServiceMock = vi.mocked(authService);

let server: TestAgent;

beforeAll(() => {
  server = request(app);
});

describe("POST /user Request", () => {
  it("returns 200 when user is registered successfully", async () => {
    // Arrange
    authServiceMock.registerUser.mockResolvedValueOnce(undefined);

    // Act
    const res = await server.post("/api/v1/auth/register").send(newUser);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User Registered");
    expect(authServiceMock.registerUser).toHaveBeenCalledWith(newUser);
  });

  it("returns 400 when user registration fails due to validation error", async () => {
    // Arrange
    const validationError = new ZodError([
      {
        code: "custom",
        path: ["email"],
        message: "Invalid email",
      },
    ]);
    authServiceMock.registerUser.mockRejectedValueOnce(validationError);

    // Act
    const res = await server.post("/api/v1/auth/register").send(newUser);

    // Assert
    expect(res.statusCode).toBe(422);
    expect(res.body.message).toBe("Please sent valid information");
  });

  it("returns 500 when user registration fails due to server error", async () => {
    // Arrange
    const serverError = new AppError("Internal server error", 500);
    authServiceMock.registerUser.mockRejectedValueOnce(serverError);

    // Act
    const res = await server.post("/api/v1/auth/register").send(newUser);

    // Assert
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });
});

describe("POST /login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    email: "user@example.com",
    password: "correct-password",
  };

  it("returns 200 and success response on valid credentials", async () => {
    vi.mocked(authService.loginUser).mockResolvedValue(undefined);

    const res = await server.post("/api/v1/auth/login").send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      message: "User Logged In",
      data: null,
    });
    expect(authService.loginUser).toHaveBeenCalledWith(
      validPayload,
      expect.anything(),
    );
  });

  it("returns 401 when credentials are invalid", async () => {
    vi.mocked(authService.loginUser).mockRejectedValue(
      new AuthenticationError("Invalid email or password"),
    );

    const res = await server.post("/api/v1/auth/login").send(validPayload);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it("returns 401 when the user account is deactivated", async () => {
    vi.mocked(authService.loginUser).mockRejectedValue(
      new AuthenticationError("User account is deactivated"),
    );

    const res = await server.post("/api/v1/auth/login").send(validPayload);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/deactivated/i);
  });

  it("returns 422 when the request body fails schema validation", async () => {
    vi.mocked(authService.loginUser).mockRejectedValue(
      new ZodError([
        {
          code: "custom",
          path: ["email"],
          message: "Invalid email",
        },
      ]),
    );

    const res = await server
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Please sent valid information");
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(authService.loginUser).mockRejectedValue(
      new Error("Something went wrong"),
    );

    const res = await server.post("/api/v1/auth/login").send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Unexpected Error Occured");
  });
});

describe("POST /auth/refresh-token", () => {
  const REFRESH_TOKEN_ROUTE = "/api/v1/auth/refresh";

  beforeEach(() => {
    vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
      "valid-refresh-token",
    );
    vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue("user-123");
    vi.clearAllMocks();
  });

  it("returns 200 and success response when refresh succeeds", async () => {
    vi.mocked(authService.refreshToken).mockResolvedValue(undefined);

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      statusCode: 200,
      message: "Token Refreshed",
      data: null,
      success: true,
    });
    expect(authService.refreshToken).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );
  });

  it("returns 401 when authService.refreshToken throws AuthenticationError", async () => {
    vi.mocked(authService.refreshToken).mockRejectedValue(
      new AuthenticationError("User is not logged In"),
    );

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User is not logged In");
  });

  it("returns 401 with session-expired message when authService.refreshToken throws JWTExpired", async () => {
    vi.mocked(authService.refreshToken).mockRejectedValue(
      new JWTExpired("refresh token expired", {
        code: "ERR_JWT_EXPIRED",
      } as any),
    );

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User Session expired, Please Log in again");
  });

  it("returns 404 when authService.refreshToken throws UserNotFoundError", async () => {
    vi.mocked(authService.refreshToken).mockRejectedValue(
      new UserNotFoundError("User not found"),
    );

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("returns 500 when authService.refreshToken throws an unexpected error", async () => {
    vi.mocked(authService.refreshToken).mockRejectedValue(
      new Error("Something went wrong"),
    );

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Unexpected Error Occured");
  });
});

describe("POST /auth/logout", () => {
  const LOGOUT_PATH = "/api/v1/auth/logout";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the access token is valid", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        "valid-refresh-token",
      );
      vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue("user-123");
    });

    it("should logout successfully and clear cookies", async () => {
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        statusCode: 200,
        data: null,
        message: "User Logged Out",
        success: true,
      });
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if authService.logout throws an unexpected error", async () => {
      vi.mocked(authService.logout).mockRejectedValue(new Error("db down"));

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 500,
      });
    });
  });

  describe("when the access token is missing", () => {
    it("should return 401 MissingTokenError and never call authService.logout", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        null,
      );

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
      });
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is expired", () => {
    it("should return 401 with a session-expired message", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        "expired-token",
      );
      vi.mocked(jwtService.verifyRefreshToken).mockRejectedValue(
        new JWTExpired("exp claim timestamp check failed", {}),
      );

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(
        "User Session expired, Please Log in again",
      );
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is malformed", () => {
    it("should return 401 for an invalid JWT", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        "not-a-jwt",
      );
      vi.mocked(jwtService.verifyRefreshToken).mockRejectedValue(
        new JWTInvalid("Invalid JWT"),
      );

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(401);
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe("when the access token signature is invalid", () => {
    it("should return 401 for a signature verification failure", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        "tampered-token",
      );
      vi.mocked(jwtService.verifyRefreshToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("signature verification failed"),
      );

      const response = await server.post(LOGOUT_PATH);

      expect(response.status).toBe(401);
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });
});

describe("POST /auth/activate", () => {
  const ACTIVATE_PATH = "/api/v1/auth/activate";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the access token is valid", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "valid-access-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    });

    it("should activate the user and return 200", async () => {
      vi.mocked(authService.activateUserStatus).mockResolvedValue(
        {} as QueryResult<never>,
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        statusCode: 200,
        message: "User Account Activated",
        data: null,
        success: true,
      });
      expect(authService.activateUserStatus).toHaveBeenCalledWith("user-123");
    });

    it("should return 409 when the user is already active", async () => {
      vi.mocked(authService.activateUserStatus).mockRejectedValue(
        new UserAlreadyActiveError("User is already active"),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User is already active");
    });

    it("should return 404 when the user does not exist", async () => {
      vi.mocked(authService.activateUserStatus).mockRejectedValue(
        new UserNotFoundError("User not found"),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 when authService.activateUserStatus throws an unexpected error", async () => {
      vi.mocked(authService.activateUserStatus).mockRejectedValue(
        new Error("db down"),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 500,
      });
    });
  });

  describe("when the access token is missing", () => {
    it("should return 401 MissingTokenError and never call authService.activateUserStatus", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        null,
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
      });
      expect(authService.activateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is expired", () => {
    it("should return 401 with a session-expired message", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "expired-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTExpired("exp claim timestamp check failed", {}),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(
        "User Session expired, Please Log in again",
      );
      expect(authService.activateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is malformed", () => {
    it("should return 401 for an invalid JWT", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "not-a-jwt",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("Invalid JWT"),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(authService.activateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token signature is invalid", () => {
    it("should return 401 for a signature verification failure", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "tampered-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("signature verification failed"),
      );

      const response = await server.post(ACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(authService.activateUserStatus).not.toHaveBeenCalled();
    });
  });
});

describe("POST /auth/deactivate", () => {
  const DEACTIVATE_PATH = "/api/v1/auth/deactivate";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the access token is valid", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "valid-access-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user-123");
    });

    it("should deactivate the user and return 200", async () => {
      vi.mocked(authService.deactivateUserStatus).mockResolvedValue(
        {} as QueryResult<never>,
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        statusCode: 200,
        message: "User Account DeActivated",
        data: null,
        success: true,
      });
      expect(authService.deactivateUserStatus).toHaveBeenCalledWith("user-123");
    });

    it("should return 409 when the user is already deactivated", async () => {
      vi.mocked(authService.deactivateUserStatus).mockRejectedValue(
        new UserAlreadyDeactivatedError("User is already deactivated"),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User is already deactivated");
    });

    it("should return 404 when the user does not exist", async () => {
      vi.mocked(authService.deactivateUserStatus).mockRejectedValue(
        new UserNotFoundError("User not found"),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 when authService.deactivateUserStatus throws an unexpected error", async () => {
      vi.mocked(authService.deactivateUserStatus).mockRejectedValue(
        new Error("db down"),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 500,
      });
    });
  });

  describe("when the access token is missing", () => {
    it("should return 401 MissingTokenError and never call authService.deactivateUserStatus", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        null,
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
      });
      expect(authService.deactivateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is expired", () => {
    it("should return 401 with a session-expired message", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "expired-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTExpired("exp claim timestamp check failed", {}),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(
        "User Session expired, Please Log in again",
      );
      expect(authService.deactivateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token is malformed", () => {
    it("should return 401 for an invalid JWT", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "not-a-jwt",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("Invalid JWT"),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(authService.deactivateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe("when the access token signature is invalid", () => {
    it("should return 401 for a signature verification failure", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "tampered-token",
      );
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("signature verification failed"),
      );

      const response = await server.post(DEACTIVATE_PATH);

      expect(response.status).toBe(401);
      expect(authService.deactivateUserStatus).not.toHaveBeenCalled();
    });
  });
});
