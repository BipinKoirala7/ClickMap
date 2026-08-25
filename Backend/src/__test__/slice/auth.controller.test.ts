import app from "@/app";
import type { RegisterUserDto } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { ZodError } from "zod";
import request from "supertest";
import type TestAgent from "supertest/lib/agent";
import { describe, expect, it, beforeAll, vi, beforeEach } from "vitest";
import AppError from "@/errors/AppError";
import { AuthenticationError } from "@/errors/Errors";

vi.mock("@/modules/auth/auth.service.ts");

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
