import { AuthenticationError, UserNotFoundError } from "@/errors/Errors";
import type { User } from "@/modules/auth/auth.schema";
import { userRepository } from "@/modules/user/user.repository";
import type { UpdateUserDto } from "@/modules/user/user.schema";
import { userService } from "@/modules/user/user.service";
import { nanoid } from "nanoid";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

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
  updatedAt: new Date(),
};

describe("Get User By Id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  });

  it("should throw Authentication Error when id is empty string", async () => {
    await expect(userService.getUserById("")).rejects.toThrow(
      AuthenticationError,
    );
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when id is undefined", async () => {
    await expect(userService.getUserById(undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should propagate error when repository throws an error", async () => {
    const error = new Error("Database connection error");
    mockedUserRepository.findById.mockRejectedValue(error);

    await expect(userService.getUserById(mockedUser.id)).rejects.toThrow(
      "Database connection error",
    );
  });

  it("should throw UserNotFoundError when repository returns no user", async () => {
    mockedUserRepository.findById.mockResolvedValue(undefined);

    await expect(userService.getUserById("some-id")).rejects.toThrow(
      UserNotFoundError,
    );
    expect(mockedUserRepository.findById).toHaveBeenCalledWith("some-id");
  });

  it("should throw Error when Zod schema validation fails", async () => {
    const invalidUser = {
      id: mockedUser.id,
      name: 123, // Invalid type
      userName: mockedUser.userName,
      email: mockedUser.email,
      password: mockedUser.password,
      plan: mockedUser.plan,
      isActive: mockedUser.isActive,
      isVerified: mockedUser.isVerified,
      createdAt: mockedUser.createdAt,
      updatedAt: mockedUser.updatedAt,
    } as unknown as User;

    mockedUserRepository.findById.mockResolvedValue(invalidUser);

    await expect(userService.getUserById(mockedUser.id)).rejects.toThrow(
      ZodError,
    );
  });
});

describe("Update User", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw error when userId is not provided", async () => {
    await expect(userService.updateUser(undefined, {})).rejects.toThrow(
      AuthenticationError,
    );
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should thow error when userId with user is not found", async () => {
    // Arrange
    mockedUserRepository.findById.mockResolvedValue(undefined);

    // Act & Assert
    await expect(userService.updateUser("some-wrong-id", {})).rejects.toThrow(
      UserNotFoundError,
    );
    expect(mockedUserRepository.updateUserById).not.toHaveBeenCalled();
  });

  it("should update user", async () => {
    // Arrange
    const updateUserInfo: UpdateUserDto = {
      name: "Bipin Koirala",
      userName: "bipin123",
    } as UpdateUserDto;
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    // Act
    await userService.updateUser(mockedUser.id, updateUserInfo);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(mockedUser.id);
    expect(userRepository.updateUserById).toHaveBeenCalledWith(mockedUser.id, {
      name: updateUserInfo.name,
      userName: updateUserInfo.userName,
    });
  });

  it("should throw error when userId is not provided", async () => {
    await expect(userService.updateUser(undefined, {})).rejects.toThrow(
      AuthenticationError,
    );
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(userService.updateUser("", {})).rejects.toThrow(
      AuthenticationError,
    );
    expect(mockedUserRepository.findById).not.toHaveBeenCalled();
  });

  it("should thow error when userId with user is not found", async () => {
    // Arrange
    mockedUserRepository.findById.mockResolvedValue(undefined);

    // Act & Assert
    await expect(userService.updateUser("some-wrong-id", {})).rejects.toThrow(
      UserNotFoundError,
    );
    expect(mockedUserRepository.updateUserById).not.toHaveBeenCalled();
  });

  it("should throw ZodError when update payload fails schema validation", async () => {
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    const invalidUpdate = {
      name: 123, // invalid type
    } as unknown as UpdateUserDto;

    await expect(
      userService.updateUser(mockedUser.id, invalidUpdate),
    ).rejects.toThrow(ZodError);
    expect(mockedUserRepository.updateUserById).not.toHaveBeenCalled();
  });

  it("should update user", async () => {
    // Arrange
    const updateUserInfo: UpdateUserDto = {
      name: "Bipin Koirala",
      userName: "bipin123",
    } as UpdateUserDto;
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    // Act
    await userService.updateUser(mockedUser.id, updateUserInfo);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(mockedUser.id);
    expect(userRepository.updateUserById).toHaveBeenCalledWith(mockedUser.id, {
      name: updateUserInfo.name,
      userName: updateUserInfo.userName,
    });
  });

  it("should strip fields not allowed by the update schema (email, password, plan)", async () => {
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    const updateUserInfo: UpdateUserDto = {
      name: "New Name",
      userName: "newusername",
      email: "shouldnotupdate@gmail.com",
      password: "ShouldNotUpdate@123",
      plan: "pro",
    } as unknown as UpdateUserDto;

    await userService.updateUser(mockedUser.id, updateUserInfo);

    expect(mockedUserRepository.updateUserById).toHaveBeenCalledWith(
      mockedUser.id,
      {
        name: updateUserInfo.name,
        userName: updateUserInfo.userName,
        email: updateUserInfo.email,
      },
    );
  });

  it("should support a partial update with only one field provided", async () => {
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    const updateUserInfo = { name: "Only Name Updated" } as UpdateUserDto;

    await userService.updateUser(mockedUser.id, updateUserInfo);

    expect(mockedUserRepository.updateUserById).toHaveBeenCalledWith(
      mockedUser.id,
      { name: updateUserInfo.name, userName: undefined },
    );
  });

  it("should propagate error when repository throws during findById", async () => {
    const error = new Error("Database connection error");
    mockedUserRepository.findById.mockRejectedValue(error);

    await expect(
      userService.updateUser(mockedUser.id, { name: "X" } as UpdateUserDto),
    ).rejects.toThrow("Database connection error");
    expect(mockedUserRepository.updateUserById).not.toHaveBeenCalled();
  });

  it("should propagate error when repository throws during updateUserById", async () => {
    mockedUserRepository.findById.mockResolvedValue(mockedUser);
    const error = new Error("Update failed");
    mockedUserRepository.updateUserById.mockRejectedValue(error);

    await expect(
      userService.updateUser(mockedUser.id, {
        name: "Bipin",
      } as UpdateUserDto),
    ).rejects.toThrow("Update failed");
  });

  it("should call findById exactly once and updateUserById exactly once on success", async () => {
    mockedUserRepository.findById.mockResolvedValue(mockedUser);

    await userService.updateUser(mockedUser.id, {
      name: "Bipin",
    } as UpdateUserDto);

    expect(mockedUserRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.updateUserById).toHaveBeenCalledTimes(1);
  });
});
