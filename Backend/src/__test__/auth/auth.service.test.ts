import {
  type ActiveRefreshToken,
  type RegisterUserDto,
  type User,
} from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { userRepository } from "@/modules/user/user.repository";
import { vi, describe, expect, it, beforeEach } from "vitest";
import { ZodError } from "zod";

import { userService } from "@/modules/user/user.service";
import { jwtService } from "@/modules/auth/jwt.service";
import { cookiesService } from "@/modules/auth/cookies.service";
import { logger } from "@/lib/logger";
import { UserNotFoundError, AuthenticationError } from "@/errors/Errors";
import { config } from "@/config";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { authRepository } from "@/modules/auth/auth.repository";

vi.mock("bcryptjs");

vi.mock("@/modules/user/user.service");
vi.mock("@/modules/auth/jwt.service");
vi.mock("@/modules/auth/cookies.service");
vi.mock("@/modules/auth/auth.repository");
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/modules/user/user.repository.ts");

const mockedUserRepository = vi.mocked(userRepository);
const mockedBcryptCompare = vi.mocked(
  bcrypt.compare as (data: string, encrypted: string) => Promise<boolean>,
);

const newUser: RegisterUserDto = {
  name: "Bipin Koirala",
  userName: "bipin123",
  email: "bipin@gmail.com",
  password: "BipinPass@123",
};

const createdUser: User = {
  id: "some-unique-id",
  ...newUser,
  plan: "free",
  isActive: false,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Register User", () => {
  it("should call userRepository.createUser with correct data", async () => {
    // Arrange
    mockedUserRepository.createUser.mockResolvedValue(createdUser.id);

    // Act
    await authService.registerUser(newUser);

    // Assert
    expect(mockedUserRepository.createUser).toHaveBeenCalledWith(newUser);
  });

  it("should throw an error if userRepository.createUser fails", async () => {
    // Arrange
    mockedUserRepository.createUser.mockRejectedValue(
      new Error("Database error"),
    );

    // Act & Assert
    await expect(authService.registerUser(newUser)).rejects.toThrow(
      "Database error",
    );
  });

  it.each([
    {
      description: "email is invalid",
      data: { email: "invalid-email" },
    },
    {
      description: "password is empty",
      data: { password: "" },
    },
    {
      description: "password is less than 8 characters",
      data: { password: "Pass1" },
    },
    {
      description: "password is without uppercase character",
      data: { password: "password123" },
    },
    {
      description: "password is without lowercase character",
      data: { password: "PASSWORD123" },
    },
    {
      description: "password is without number",
      data: { password: "Password" },
    },
  ])("it should throw an error when $description", async ({ data }) => {
    await expect(
      authService.registerUser({
        ...newUser,
        ...data,
      }),
    ).rejects.toThrow(ZodError);

    expect(mockedUserRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("Login User", () => {
  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    password: "Hashed1password",
    isActive: true,
  } as User;

  const loginData = {
    email: "test@example.com",
    password: "Plain-password1",
  };

  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {} as Response;

    vi.mocked(mockedBcryptCompare).mockResolvedValue(true);
    vi.mocked(userService.getByEmail).mockResolvedValue(mockUser);
    vi.mocked(jwtService.createRefreshToken).mockResolvedValue("refresh-token");
    vi.mocked(jwtService.createAccessToken).mockResolvedValue("access-token");
    vi.mocked(cookiesService.setRefreshCookiesInResponse).mockResolvedValue(
      undefined,
    );
    vi.mocked(cookiesService.setAccessCookiesInResponse).mockResolvedValue(
      undefined,
    );
  });

  it("logs in a valid user successfully", async () => {
    await authService.loginUser(loginData, res);

    expect(userService.getByEmail).toHaveBeenCalledWith(loginData.email);
    expect(mockedBcryptCompare).toHaveBeenCalledWith(
      loginData.password,
      mockUser.password,
    );
    expect(jwtService.createRefreshToken).toHaveBeenCalledWith(mockUser.id);
    expect(jwtService.createAccessToken).toHaveBeenCalledWith(mockUser);

    expect(cookiesService.setRefreshCookiesInResponse).toHaveBeenCalledWith(
      res,
      "refresh-token",
    );
    expect(cookiesService.setAccessCookiesInResponse).toHaveBeenCalledWith(
      res,
      "access-token",
    );
    expect(logger.info).toHaveBeenCalledWith(
      { userId: mockUser.id },
      "User logged in successfully",
    );
  });

  it("computes expiresAt based on config.REFRESH_TOKEN_EXPIRATION", async () => {
    const fixedNow = Date.now();
    vi.useFakeTimers({ now: fixedNow });
    vi.mocked(mockedBcryptCompare).mockResolvedValue(true);

    await authService.loginUser(loginData, res);

    const expectedExpiresAt = new Date(
      fixedNow + config.REFRESH_TOKEN_EXPIRATION,
    );
    expect(authRepository.setActiveRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: expectedExpiresAt }),
    );

    vi.useRealTimers();
  });

  it("throws a validation error for malformed login data", async () => {
    await expect(
      authService.loginUser({ email: "not-an-email" }, res),
    ).rejects.toThrow();

    expect(userService.getByEmail).not.toHaveBeenCalled();
  });

  it("throws AuthenticationError when the user is not found", async () => {
    vi.mocked(userService.getByEmail).mockRejectedValue(
      new UserNotFoundError(),
    );

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      AuthenticationError,
    );
    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "Invalid email or password",
    );

    expect(mockedBcryptCompare).not.toHaveBeenCalled();
  });

  it("rethrows a generic error when getByEmail fails unexpectedly", async () => {
    vi.mocked(userService.getByEmail).mockRejectedValue(
      new Error("DB connection lost"),
    );

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "Something went wrong",
    );
  });

  it("throws AuthenticationError and logs a warning on invalid password", async () => {
    vi.mocked(mockedBcryptCompare).mockResolvedValue(false);

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      AuthenticationError,
    );
    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "Invalid email or password",
    );

    expect(logger.warn).toHaveBeenCalledWith(
      { userId: mockUser.id },
      "Invalid password attempt",
    );
    expect(jwtService.createRefreshToken).not.toHaveBeenCalled();
  });

  it("throws AuthenticationError and logs a warning for an inactive account", async () => {
    vi.mocked(userService.getByEmail).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      AuthenticationError,
    );
    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "User account is deactivated",
    );

    expect(logger.warn).toHaveBeenCalledWith(
      { userId: mockUser.id },
      "Attempted login for inactive user",
    );
    expect(jwtService.createRefreshToken).not.toHaveBeenCalled();
  });

  it("does not set cookies if token creation fails", async () => {
    vi.mocked(jwtService.createAccessToken).mockRejectedValue(
      new Error("Signing failed"),
    );

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "Signing failed",
    );

    expect(cookiesService.setRefreshCookiesInResponse).not.toHaveBeenCalled();
    expect(cookiesService.setAccessCookiesInResponse).not.toHaveBeenCalled();
  });
});

describe("Refresh Token", () => {
  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    password: "Hashed1password",
    isActive: true,
  } as User;

  const refreshToken = "refresh-token";
  const accessToken = "access-token";

  const mockActiveRefreshToken: ActiveRefreshToken = {
    id: "some-id",
    userId: mockUser.id,
    refreshToken: refreshToken,
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let res: Response;
  let req: Request;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {} as Response;
    req = {} as Request;
  });

  it("it should refresh token successfully", async () => {
    // Arrange
    vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
      refreshToken,
    );
    vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
    vi.mocked(authRepository.getActiveRefreshToken).mockResolvedValue(
      mockActiveRefreshToken,
    );
    vi.mocked(userService.getById).mockResolvedValue(mockUser);
    vi.mocked(jwtService.createAccessToken).mockResolvedValue(accessToken);

    // Act
    await authService.refreshToken(req, res);

    // Assert
    expect(cookiesService.getRefreshCookiesFromRequest).toHaveBeenCalledWith(
      req,
    );
    expect(jwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(authRepository.getActiveRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      refreshToken,
    );
    expect(userService.getById).toHaveBeenCalledWith(mockUser.id);
    expect(jwtService.createAccessToken).toHaveBeenCalledWith(mockUser);
    expect(cookiesService.setAccessCookiesInResponse).toHaveBeenCalledWith(
      res,
      accessToken,
    );
  });
});
