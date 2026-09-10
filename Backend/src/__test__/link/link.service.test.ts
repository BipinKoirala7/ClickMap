import type { User } from "@/modules/auth/auth.schema";
import {
  AuthenticationError,
  LinkAlreadyActiveError,
  LinkAlreadyDeactivatedError,
  LinkNotFoundError,
  UserNotFoundError,
} from "@/errors/Errors";
import { linkRepository } from "@/modules/links/links.repository";
import {
  type CreateLinkDto,
  type PublicLinkDto,
  type UpdateLinkDto,
} from "@/modules/links/links.schema";
import { linkService } from "@/modules/links/links.service";
import { userService } from "@/modules/user/user.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/links/links.repository.ts");
vi.mock("@/modules/user/user.service.ts");

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

    // Act
    await linkService.createLink(userId, valid_link);

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(userId);
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
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.createLink("", valid_link)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.createLink(userId, valid_link)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when link validation fails", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);

    await expect(
      linkService.createLink(userId, {} as PublicLinkDto),
    ).rejects.toThrow();
    expect(linkRepository.createLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when link creation fails", async () => {
    const error = new Error("Link creation failed");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
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

describe("Get user links", () => {
  it("should successfully return a user's links", async () => {
    // Arrange
    const links: PublicLinkDto[] = [
      {
        id: "link123",
        originalUrl: "https://example.com",
        shortCode: "abc123",
        title: "Example Link",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      },
      {
        id: "link456",
        originalUrl: "https://example.org",
        shortCode: "def456",
        title: "Another Link",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 200000),
      },
    ];
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getUserLinks).mockResolvedValue(links as any);

    // Act
    const result = await linkService.getUserLinks(userId);

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(linkRepository.getUserLinks).toHaveBeenCalledWith(userId);
    expect(result).toEqual(links);
  });

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(linkService.getUserLinks(undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getUserLinks).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.getUserLinks("")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getUserLinks).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is whitespace only", async () => {
    await expect(linkService.getUserLinks("   ")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getUserLinks).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.getUserLinks(userId)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(linkRepository.getUserLinks).not.toHaveBeenCalled();
  });

  it("should propagate an error when fetching links fails", async () => {
    const error = new Error("Failed to fetch links");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getUserLinks).mockRejectedValue(error);

    await expect(linkService.getUserLinks(userId)).rejects.toThrow(
      "Failed to fetch links",
    );
  });
});

describe("Get link info", () => {
  const linkId = "link123";

  it("should successfully return link info", async () => {
    // Arrange
    const link: PublicLinkDto = {
      id: linkId,
      originalUrl: "https://example.com",
      shortCode: "abc123",
      title: "Example Link",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
    };

    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(link as any);

    // Act
    const result = await linkService.getLinkInfo(linkId, userId);

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(linkRepository.getLink).toHaveBeenCalledWith(linkId, userId);
    expect(result).toEqual(link);
  });

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(linkService.getLinkInfo(linkId, undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.getLinkInfo(linkId, "")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is whitespace only", async () => {
    await expect(linkService.getLinkInfo(linkId, "   ")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.getLinkInfo(linkId, userId)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(linkRepository.getLink).not.toHaveBeenCalled();
  });

  it("should throw LinkNotFoundError when the link does not exist", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(null as any);

    await expect(linkService.getLinkInfo(linkId, userId)).rejects.toThrow(
      LinkNotFoundError,
    );
  });

  it("should propagate an error when fetching the link fails", async () => {
    const error = new Error("Failed to fetch link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockRejectedValue(error);

    await expect(linkService.getLinkInfo(linkId, userId)).rejects.toThrow(
      "Failed to fetch link",
    );
  });
});

describe("Update link", () => {
  const linkId = "link123";
  const validUpdateData: UpdateLinkDto = {
    title: "Updated Title",
  };

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(
      linkService.updateLink(linkId, undefined, validUpdateData),
    ).rejects.toThrow(AuthenticationError);
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(
      linkService.updateLink(linkId, "", validUpdateData),
    ).rejects.toThrow(AuthenticationError);
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is whitespace only", async () => {
    await expect(
      linkService.updateLink(linkId, "   ", validUpdateData),
    ).rejects.toThrow(AuthenticationError);
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(
      linkService.updateLink(linkId, userId, validUpdateData),
    ).rejects.toThrow(UserNotFoundError);
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should throw LinkNotFoundError when the link does not exist", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(null as any);

    await expect(
      linkService.updateLink(linkId, userId, validUpdateData),
    ).rejects.toThrow(LinkNotFoundError);
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the link lookup fails", async () => {
    const error = new Error("Failed to fetch link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockRejectedValue(error);

    await expect(
      linkService.updateLink(linkId, userId, validUpdateData),
    ).rejects.toThrow("Failed to fetch link");
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when update data validation fails", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: true,
    } as any);

    await expect(
      linkService.updateLink(linkId, userId, {
        originalUrl: "not-a-url",
      } as UpdateLinkDto),
    ).rejects.toThrow();
    expect(linkRepository.updateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when updating the link fails", async () => {
    const error = new Error("Failed to update link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: true,
    } as any);
    vi.mocked(linkRepository.updateLink).mockRejectedValue(error);

    await expect(
      linkService.updateLink(linkId, userId, validUpdateData),
    ).rejects.toThrow("Failed to update link");
  });

  it("should successfully update a link", async () => {
    const existingLink = { id: linkId, isActive: true } as any;
    const updatedLink = {
      id: linkId,
      isActive: true,
      title: "Updated Title",
    } as any;

    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(existingLink);
    vi.mocked(linkRepository.updateLink).mockResolvedValue(updatedLink);

    const result = await linkService.updateLink(
      linkId,
      userId,
      validUpdateData,
    );

    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(linkRepository.getLink).toHaveBeenCalledWith(linkId, userId);
    expect(linkRepository.updateLink).toHaveBeenCalledWith(
      linkId,
      userId,
      validUpdateData,
    );
    expect(result).toEqual(updatedLink);
  });
});

describe("Activate link", () => {
  const linkId = "link123";

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(linkService.activateLink(linkId, undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.activateLink(linkId, "")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is whitespace only", async () => {
    await expect(linkService.activateLink(linkId, "   ")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.activateLink(linkId, userId)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should throw LinkNotFoundError when the link does not exist", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(null as any);

    await expect(linkService.activateLink(linkId, userId)).rejects.toThrow(
      LinkNotFoundError,
    );
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the link lookup fails", async () => {
    const error = new Error("Failed to fetch link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockRejectedValue(error);

    await expect(linkService.activateLink(linkId, userId)).rejects.toThrow(
      "Failed to fetch link",
    );
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should throw LinkAlreadyActiveError when the link is already active", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: true,
    } as any);

    await expect(linkService.activateLink(linkId, userId)).rejects.toThrow(
      LinkAlreadyActiveError,
    );
    expect(linkRepository.activateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when activating the link fails", async () => {
    const error = new Error("Failed to activate link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: false,
    } as any);
    vi.mocked(linkRepository.activateLink).mockRejectedValue(error);

    await expect(linkService.activateLink(linkId, userId)).rejects.toThrow(
      "Failed to activate link",
    );
  });

  it("should successfully activate a link", async () => {
    const activatedLink = { id: linkId, isActive: true } as any;

    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: false,
    } as any);
    vi.mocked(linkRepository.activateLink).mockResolvedValue(activatedLink);

    const result = await linkService.activateLink(linkId, userId);

    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(linkRepository.getLink).toHaveBeenCalledWith(linkId, userId);
    expect(linkRepository.activateLink).toHaveBeenCalledWith(linkId, userId);
    expect(result).toEqual(activatedLink);
  });
});

describe("Deactivate link", () => {
  const linkId = "link123";

  it("should throw AuthenticationError when userId is undefined", async () => {
    await expect(linkService.deactivateLink(linkId, undefined)).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is an empty string", async () => {
    await expect(linkService.deactivateLink(linkId, "")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should throw AuthenticationError when userId is whitespace only", async () => {
    await expect(linkService.deactivateLink(linkId, "   ")).rejects.toThrow(
      AuthenticationError,
    );
    expect(userService.getById).not.toHaveBeenCalled();
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the user lookup fails", async () => {
    vi.mocked(userService.getById).mockRejectedValue(new UserNotFoundError());

    await expect(linkService.deactivateLink(linkId, userId)).rejects.toThrow(
      UserNotFoundError,
    );
    expect(linkRepository.getLink).not.toHaveBeenCalled();
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should throw LinkNotFoundError when the link does not exist", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue(null as any);

    await expect(linkService.deactivateLink(linkId, userId)).rejects.toThrow(
      LinkNotFoundError,
    );
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when the link lookup fails", async () => {
    const error = new Error("Failed to fetch link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockRejectedValue(error);

    await expect(linkService.deactivateLink(linkId, userId)).rejects.toThrow(
      "Failed to fetch link",
    );
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should throw LinkAlreadyDeactivatedError when the link is already inactive", async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: false,
    } as any);

    await expect(linkService.deactivateLink(linkId, userId)).rejects.toThrow(
      LinkAlreadyDeactivatedError,
    );
    expect(linkRepository.deactivateLink).not.toHaveBeenCalled();
  });

  it("should propagate an error when deactivating the link fails", async () => {
    const error = new Error("Failed to deactivate link");
    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: true,
    } as any);
    vi.mocked(linkRepository.deactivateLink).mockRejectedValue(error);

    await expect(linkService.deactivateLink(linkId, userId)).rejects.toThrow(
      "Failed to deactivate link",
    );
  });

  it("should successfully deactivate a link", async () => {
    const deactivatedLink = { id: linkId, isActive: false } as any;

    vi.mocked(userService.getById).mockResolvedValue({
      id: userId,
      name: "Test User",
    } as User);
    vi.mocked(linkRepository.getLink).mockResolvedValue({
      id: linkId,
      isActive: true,
    } as any);
    vi.mocked(linkRepository.deactivateLink).mockResolvedValue(deactivatedLink);

    const result = await linkService.deactivateLink(linkId, userId);

    expect(userService.getById).toHaveBeenCalledWith(userId);
    expect(linkRepository.getLink).toHaveBeenCalledWith(linkId, userId);
    expect(linkRepository.deactivateLink).toHaveBeenCalledWith(linkId, userId);
    expect(result).toEqual(deactivatedLink);
  });
});
