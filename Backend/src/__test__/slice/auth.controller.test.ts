import app from "@/app";
import type { RegisterUserDto } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { ZodError } from "zod";
import request from "supertest";
import type TestAgent from "supertest/lib/agent";
import { describe, expect, it, beforeAll, vi } from "vitest";
import AppError from "@/errors/AppError";

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
