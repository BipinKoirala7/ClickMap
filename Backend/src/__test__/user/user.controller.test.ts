import { userController } from "@/modules/user/user.controller";
import { userService } from "@/modules/user/user.service";
import type { Request, Response } from "express";
import type { PublicUserDto } from "@/modules/user/user.schema";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RestApiResponse from "@/types/RestApiResponse";
import { AuthenticationError, UserNotFoundError } from "@/errors/Errors";

vi.mock("@/modules/user/user.service");

const mockedUserService = vi.mocked(userService);

const mockRequest = {} as Request & { userId: string | undefined };
const mockResponse = {
  send: vi.fn(),
  json: vi.fn(),
  status: vi.fn().mockReturnThis()
} as unknown as Response;

describe("Get User", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.userId = undefined;
  });

  it("should return user data when valid userId is provided", async () => {
    // Arrange
    mockRequest.userId = "test-user-id";
    const mockedUser: PublicUserDto = {
      name: "Bipin Koirala",
      email: "bipin@example.com",
      userName: "bipinkoirala7",
      plan: "free",
      isActive: false,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockedUserService.getUserById.mockResolvedValue(mockedUser);

    // Act
    await userController.getUserController(mockRequest, mockResponse);

    // Assert
    expect(mockedUserService.getUserById).toHaveBeenCalledWith(mockRequest.userId);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(RestApiResponse.success(200, "Success", mockedUser));
  });

  it("should throw error when userId is not provided", async () => {
    // Arragne
    mockedUserService.getUserById.mockRejectedValue(new AuthenticationError());

    // Act & Assert
    await expect(userController.getUserController(mockRequest, mockResponse))
      .rejects.toMatchObject({ message: "User is not logged In", statusCode: 401 });
  });

  it("should throw error when user with given id is not found", async () => {
    // Arrange
    mockedUserService.getUserById.mockRejectedValue(new UserNotFoundError());

    // Act & Assert
    await expect(userController.getUserController(mockRequest, mockResponse)).rejects.toThrow(UserNotFoundError);
  });

});

describe("Update User", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it("should update user", async () => {
    // Arrange
    mockRequest.userId = "test-user-Id";
    mockRequest.body = {
      name: "Bipin Koirala",
      userName: "bipin07"
    }

    // Act
    await userController.updateUserController(mockRequest, mockResponse);

    // Assert
    expect(mockedUserService.updateUser).toHaveBeenCalledWith(mockRequest.userId, mockRequest.body);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(RestApiResponse.success(200, "User Info Updated", null));

  });

  it("should throw error when userId is not provided", async () => {
    mockedUserService.updateUser.mockRejectedValue(new AuthenticationError());
    await expect(userController.updateUserController(mockRequest, mockResponse)).rejects.toThrow(AuthenticationError);
  })
  it("should throw error when User with userId is not found", async () => {
    mockedUserService.updateUser.mockRejectedValue(new UserNotFoundError());
    await expect(userController.updateUserController(mockRequest, mockResponse)).rejects.toThrow(UserNotFoundError);
  })
})
