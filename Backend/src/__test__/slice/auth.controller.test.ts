import app from "@/app";
import type { RegisterUserDto } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { success, ZodError } from "zod";
import request from "supertest";
import type TestAgent from "supertest/lib/agent";
import { describe, expect, it, beforeAll, vi, beforeEach } from "vitest";
import AppError from "@/errors/AppError";
import { AuthenticationError, UserNotFoundError } from "@/errors/Errors";
import { cookiesService } from "@/modules/auth/cookies.service";
import { jwtService } from "@/modules/auth/jwt.service";
import { authRepository } from "@/modules/auth/auth.repository";
import { userService } from "@/modules/user/user.service";
import { JWTExpired } from "jose/errors";

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
      new AuthenticationError("Refresh token is missing in the request"),
    );

    const res = await server.post(REFRESH_TOKEN_ROUTE);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token is missing in the request");
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
