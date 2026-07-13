import { AuthenticationError, UserNotFoundError } from "@/errors/Errors";
import type { User } from "@/modules/auth/auth.schema";
import { userRepository } from "@/modules/user/user.repository";
import type { UpdateUserDto } from "@/modules/user/user.schema";
import { userService } from "@/modules/user/user.service";
import { nanoid } from "nanoid";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/user/user.repository.ts");

const mockedUserRepository = vi.mocked(userRepository);

const mockedUser: User = {
  id: nanoid(),
  name: "Bipin Koirala",
  userName: "bipinkoirala7",
  email: "bipin@gmail.com",
  password: "BipinPass@123",
  plan: "free",
  isActive: false,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe("Get User By Id", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  })

  it("should return user when userId is valid", async () => {
    // Arrange
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    // Act
    const result = await userService.getUserById(mockedUser.id);

    // Assert
    expect(mockedUserRepository.findById).toHaveBeenCalledWith(mockedUser.id);
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("id");
    expect(result).toMatchObject({
      name: mockedUser.name,
      userName: mockedUser.userName,
      email: mockedUser.email,
    });

  })

  it("should throw AuthenticationError when id is undefined", async () => {
    await expect(userService.getUserById(undefined)).rejects.toThrow(AuthenticationError);
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw UserNotFoundError when repository returns no user", async () => {
    mockedUserRepository.findById.mockResolvedValue(undefined);

    await expect(userService.getUserById("some-id")).rejects.toThrow(UserNotFoundError);
  });
})

describe("Update User", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  })

  it("should throw error when userId is not provided", async () => {
    await expect(userService.updateUser(undefined, {})).rejects.toThrow(AuthenticationError);
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  })

  it("should thow error when userId with user is not found", async () => {
    // Arrange
    mockedUserRepository.findById.mockResolvedValue(undefined);

    // Act & Assert
    await expect(userService.updateUser("some-wrong-id", {})).rejects.toThrow(UserNotFoundError);
    expect(mockedUserRepository.updateUserById).not.toHaveBeenCalled();
  })

  it("should update user", async () => {
    // Arrange
    const updateUserInfo = {
      name: "Bipin Koirala",
      userName: "bipin.123.123",
      isActive: true
    } as UpdateUserDto
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    // Act
    await userService.updateUser(mockedUser.id, updateUserInfo);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(mockedUser.id);
    expect(userRepository.updateUserById).toHaveBeenCalledWith(mockedUser.id, {
      name: updateUserInfo.name,
      userName: updateUserInfo.userName
    });
  })
})