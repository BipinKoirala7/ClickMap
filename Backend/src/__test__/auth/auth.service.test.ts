import {
  registerUserSchema,
  type NewUser,
  type RegisterUserDto,
  type User,
} from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { userRepository } from "@/modules/user/user.repository";
import { vi, describe, expect, it } from "vitest";
import { ZodError } from "zod";

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
