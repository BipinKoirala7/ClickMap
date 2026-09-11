import {
  type ActiveRefreshToken,
  type LoginUserDto,
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
import {
  UserNotFoundError,
  AuthenticationError,
  UserAlreadyActiveError,
  UserAlreadyDeactivatedError,
} from "@/errors/Errors";
import { config } from "@/config/config";
import type { Request, Response } from "express";
import { authRepository } from "@/modules/auth/auth.repository";
import { password } from "@/lib/password";

vi.mock("@/lib/password");
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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call userRepository.createUser with correct data", async () => {
    // Arrange
    mockedUserRepository.createUser.mockResolvedValue(createdUser.id);
    vi.mocked(password.hashPassword).mockResolvedValue("hashed-password");

    // Act
    await authService.registerUser(newUser);

    // Assert
    expect(mockedUserRepository.createUser).toHaveBeenCalledWith({
      ...newUser,
      password: "hashed-password",
    });
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

    vi.mocked(password.verifyPassword).mockResolvedValue(true);
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
    expect(password.verifyPassword).toHaveBeenCalledWith(
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
    vi.mocked(password.verifyPassword).mockResolvedValue(true);

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
      authService.loginUser({ email: "not-an-email" } as LoginUserDto, res),
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

    expect(password.verifyPassword).not.toHaveBeenCalled();
  });

  it("rethrows a generic error when getByEmail fails unexpectedly", async () => {
    vi.mocked(userService.getByEmail).mockRejectedValue(
      new Error("DB connection lost"),
    );

    await expect(authService.loginUser(loginData, res)).rejects.toThrow(
      "DB connection lost",
    );
  });

  it("throws AuthenticationError and logs a warning on invalid password", async () => {
    vi.mocked(password.verifyPassword).mockResolvedValue(false);

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
    vi.resetAllMocks();
    res = {} as Response;
    req = {} as Request;
  });

  it("should refresh token successfully", async () => {
    // Arrange
    vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
      refreshToken,
    );
    vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
    vi.mocked(userService.getById).mockResolvedValue(mockUser);
    vi.mocked(jwtService.createRefreshToken).mockResolvedValue(refreshToken);
    vi.mocked(jwtService.createAccessToken).mockResolvedValue(accessToken);

    // Act
    await authService.refreshToken(req, res);

    // Assert
    expect(cookiesService.getRefreshCookiesFromRequest).toHaveBeenCalledWith(
      req,
    );
    expect(jwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(authRepository.rotateActiveRefreshToken).toHaveBeenCalled();
    expect(userService.getById).toHaveBeenCalledWith(mockUser.id);
    expect(jwtService.createAccessToken).toHaveBeenCalledWith(mockUser);
    expect(cookiesService.setAccessCookiesInResponse).toHaveBeenCalledWith(
      res,
      accessToken,
    );
  });

  describe("when the refresh token cookie is missing", () => {
    it("throws AuthenticationError and calls nothing else", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        null,
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        "Refresh token is missing in the request",
      );

      expect(jwtService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(authRepository.getActiveRefreshToken).not.toHaveBeenCalled();
      expect(userService.getById).not.toHaveBeenCalled();
      expect(jwtService.createAccessToken).not.toHaveBeenCalled();
      expect(cookiesService.setAccessCookiesInResponse).not.toHaveBeenCalled();
    });

    it("treats an empty string cookie the same as missing (falsy check)", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        "",
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        AuthenticationError,
      );
      expect(jwtService.verifyRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("when refresh token verification fails", () => {
    it("propagates AuthenticationError for an invalid/expired/malformed JWT", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      vi.mocked(jwtService.verifyRefreshToken).mockRejectedValue(
        new AuthenticationError("Invalid token"),
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        AuthenticationError,
      );

      expect(authRepository.getActiveRefreshToken).not.toHaveBeenCalled();
      expect(userService.getById).not.toHaveBeenCalled();
      expect(jwtService.createAccessToken).not.toHaveBeenCalled();
      expect(cookiesService.setAccessCookiesInResponse).not.toHaveBeenCalled();
    });

    it("propagates AuthenticationError when jose throws (e.g. bad signature/expired)", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      // Simulates jose.jwtVerify throwing (JWTExpired, JWSSignatureVerificationFailed, etc.)
      vi.mocked(jwtService.verifyRefreshToken).mockRejectedValue(
        new Error("JWTExpired: exp claim timestamp check failed"),
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        "JWTExpired",
      );
      expect(authRepository.getActiveRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("when the user can't be found", () => {
    it("propagates UserNotFoundError (e.g. user deleted after token was issued)", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
      vi.mocked(authRepository.getActiveRefreshToken).mockResolvedValue(
        mockActiveRefreshToken,
      );
      vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(jwtService.createAccessToken).not.toHaveBeenCalled();
      expect(cookiesService.setAccessCookiesInResponse).not.toHaveBeenCalled();
    });
  });

  describe("when access token creation fails", () => {
    it("propagates the signing error and never sets a cookie", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
      vi.mocked(authRepository.getActiveRefreshToken).mockResolvedValue(
        mockActiveRefreshToken,
      );
      vi.mocked(userService.getById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.createAccessToken).mockRejectedValue(
        new Error("Signing failed"),
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        "Signing failed",
      );

      expect(cookiesService.setAccessCookiesInResponse).not.toHaveBeenCalled();
    });
  });

  describe("when setting the response cookie fails", () => {
    it("propagates the error even though the access token was already created", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
      vi.mocked(authRepository.getActiveRefreshToken).mockResolvedValue(
        mockActiveRefreshToken,
      );
      vi.mocked(userService.getById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.createAccessToken).mockResolvedValue(accessToken);
      vi.mocked(cookiesService.setAccessCookiesInResponse).mockRejectedValue(
        new Error("Failed to set cookie"),
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow(
        "Failed to set cookie",
      );
    });
  });

  describe("logging behavior", () => {
    it("logs a warning (without throwing details) when the cookie is missing", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        null,
      );

      await expect(authService.refreshToken(req, res)).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalledWith(
        "Refresh token missing in request",
      );
    });

    it("logs a debug message with the userId on success", async () => {
      vi.mocked(cookiesService.getRefreshCookiesFromRequest).mockReturnValue(
        refreshToken,
      );
      vi.mocked(jwtService.verifyRefreshToken).mockResolvedValue(mockUser.id);
      vi.mocked(authRepository.getActiveRefreshToken).mockResolvedValue(
        mockActiveRefreshToken,
      );
      vi.mocked(userService.getById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.createAccessToken).mockResolvedValue(accessToken);

      await authService.refreshToken(req, res);

      expect(logger.debug).toHaveBeenCalledWith(
        { userId: mockUser.id },
        "Access token refreshed",
      );
    });
  });
});

const USER_ID = "user-123";
describe("activateUserStatus", () => {
  it("activates an inactive user and returns the repository result", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: false,
    } as any);
    const updateResult = { affectedRows: 1 };
    vi.mocked(userRepository.updateUserStatus).mockResolvedValueOnce(
      updateResult as any,
    );

    const result = await authService.activateUserStatus(USER_ID);

    expect(userRepository.updateUserStatus).toHaveBeenCalledWith(USER_ID, true);
    expect(logger.info).toHaveBeenCalledWith(
      { userId: USER_ID },
      "User activated",
    );
    expect(result).toBe(updateResult);
  });

  it("throws AuthenticationError when id is undefined", async () => {
    await expect(authService.activateUserStatus(undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "activateUserStatus called with undefined ID",
    );
    expect(userService.getById).not.toHaveBeenCalled();
  });

  it("throws AuthenticationError when id is null (loose equality check)", async () => {
    // `id == undefined` also matches null; the type signature is string | undefined
    // but this guards against runtime values that bypass TS checks.
    await expect(
      authService.activateUserStatus(null as unknown as undefined),
    ).rejects.toThrow(AuthenticationError);
    expect(userService.getById).not.toHaveBeenCalled();
  });

  it("propagates UserNotFoundError when the user does not exist", async () => {
    vi.mocked(userService.getById).mockRejectedValueOnce(
      new UserNotFoundError(),
    );

    await expect(authService.activateUserStatus(USER_ID)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
  });

  it("throws UserAlreadyActiveError when the user is already active", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: true,
    } as any);

    await expect(authService.activateUserStatus(USER_ID)).rejects.toThrow(
      UserAlreadyActiveError,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      { userId: USER_ID },
      "Attempted to activate an already active user",
    );
    expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
  });

  it("activates an inactive user and returns the repository result", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: false,
    } as any);
    const updateResult = { affectedRows: 1 };
    vi.mocked(userRepository.updateUserStatus).mockResolvedValueOnce(
      updateResult as any,
    );

    const result = await authService.activateUserStatus(USER_ID);

    expect(userRepository.updateUserStatus).toHaveBeenCalledWith(USER_ID, true);
    expect(logger.info).toHaveBeenCalledWith(
      { userId: USER_ID },
      "User activated",
    );
    expect(result).toBe(updateResult);
  });

  it("propagates errors thrown by the repository update", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: false,
    } as any);
    const dbError = new Error("db connection lost");
    vi.mocked(userRepository.updateUserStatus).mockRejectedValueOnce(dbError);

    await expect(authService.activateUserStatus(USER_ID)).rejects.toThrow(
      dbError,
    );
    expect(logger.info).not.toHaveBeenCalled();
  });
});

describe("deactivateUserStatus", () => {
  it("deactivates an active user and returns the repository result", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: true,
    } as any);
    const updateResult = { affectedRows: 1 };
    vi.mocked(userRepository.updateUserStatus).mockResolvedValueOnce(
      updateResult as any,
    );

    const result = await authService.deactivateUserStatus(USER_ID);

    expect(userRepository.updateUserStatus).toHaveBeenCalledWith(
      USER_ID,
      false,
    );
    expect(logger.info).toHaveBeenCalledWith(
      { userId: USER_ID },
      "User deactivated",
    );
    expect(result).toBe(updateResult);
  });

  it("throws AuthenticationError when id is undefined", async () => {
    await expect(authService.deactivateUserStatus(undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "deactivateUserStatus called with undefined ID",
    );
    expect(userService.getById).not.toHaveBeenCalled();
  });

  it("throws AuthenticationError when id is null (loose equality check)", async () => {
    await expect(
      authService.deactivateUserStatus(null as unknown as undefined),
    ).rejects.toThrow(AuthenticationError);
    expect(userService.getById).not.toHaveBeenCalled();
  });

  it("propagates UserNotFoundError when the user does not exist", async () => {
    vi.mocked(userService.getById).mockRejectedValueOnce(
      new UserNotFoundError(),
    );

    await expect(authService.deactivateUserStatus(USER_ID)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
  });

  it("throws UserAlreadyDeactivatedError when the user is already inactive", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: false,
    } as any);

    await expect(authService.deactivateUserStatus(USER_ID)).rejects.toThrow(
      UserAlreadyDeactivatedError,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      { userId: USER_ID },
      "Attempted to deactivate an already deactivated user",
    );
    expect(userRepository.updateUserStatus).not.toHaveBeenCalled();
  });

  it("deactivates an active user and returns the repository result", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: true,
    } as any);
    const updateResult = { affectedRows: 1 };
    vi.mocked(userRepository.updateUserStatus).mockResolvedValueOnce(
      updateResult as any,
    );

    const result = await authService.deactivateUserStatus(USER_ID);

    expect(userRepository.updateUserStatus).toHaveBeenCalledWith(
      USER_ID,
      false,
    );
    expect(logger.info).toHaveBeenCalledWith(
      { userId: USER_ID },
      "User deactivated",
    );
    expect(result).toBe(updateResult);
  });

  it("propagates errors thrown by the repository update", async () => {
    vi.mocked(userService.getById).mockResolvedValueOnce({
      id: USER_ID,
      isActive: true,
    } as any);
    const dbError = new Error("db connection lost");
    vi.mocked(userRepository.updateUserStatus).mockRejectedValueOnce(dbError);

    await expect(authService.deactivateUserStatus(USER_ID)).rejects.toThrow(
      dbError,
    );
    expect(logger.info).not.toHaveBeenCalled();
  });
});
