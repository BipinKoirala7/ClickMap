import type { User } from "@/modules/auth/auth.schema";
import { AuthenticationError, UserNotFoundError } from "@/errors/Errors";
import { linkRepository } from "@/modules/links/links.repository";
import {
  createLinkSchema,
  type CreateLinkDto,
} from "@/modules/links/links.schema";
import { linkService } from "@/modules/links/links.service";
import { userService } from "@/modules/user/user.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/links/links.repository.ts");
vi.mock("@/modules/user/user.service.ts");
vi.mock("@/modules/links/links.schema.ts");

const valid_link: CreateLinkDto = {
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "Example Link",
};

const userId = "user123";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Create link", () => {
  it("should successfully create a link", async () => {
    // Arrange
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(createLinkSchema.parse).mockReturnValue(valid_link);

    // Act
    await linkService.createLink(userId, valid_link);

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(createLinkSchema.parse).toHaveBeenCalledWith(valid_link);
    expect(linkRepository.createLink).toHaveBeenCalledWith({
      userId,
      ...valid_link,
    });
  });

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(linkService.createLink(undefined, valid_link)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(createLinkSchema.parse).not.toHaveBeenCalled();
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.createLink("", valid_link)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(createLinkSchema.parse).not.toHaveBeenCalled();
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.createLink(userId, valid_link)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(createLinkSchema.parse).not.toHaveBeenCalled();
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when link validation fails", async () => {
    const error = new Error("Invalid link data");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(createLinkSchema.parse).mockImplementation(() => {
      throw error;
    });

    await expect(linkService.createLink(userId, valid_link)).rejects.toThrow(
      "Invalid link data",
    );
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when link creation fails", async () => {
    const error = new Error("Link creation failed");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(createLinkSchema.parse).mockReturnValue(valid_link);
    vi.mocked(linkRepository.createLink).mockRejectedValue(error);

    await expect(linkService.createLink(userId, valid_link)).rejects.toThrow(
      "Link creation failed",
    );
    expect(linkRepository.createLink).toHaveBeenCalledWith({
      userId,
      ...valid_link,
    });
  });
});
