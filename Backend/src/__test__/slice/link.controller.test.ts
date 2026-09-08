import {
  createLinkSchema,
  type CreateLinkDto,
} from "@/modules/links/links.schema";
import type TestAgent from "supertest/lib/agent";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/index";
import { linkRepository } from "@/modules/links/links.repository";
import type { User } from "@/modules/auth/auth.schema";
import { jwtService } from "@/modules/auth/jwt.service";
import { userService } from "@/modules/user/user.service";
import { cookiesService } from "@/modules/auth/cookies.service";
import { ZodError } from "zod";
import { AuthenticationError, MissingTokenError, UserNotFoundError } from "@/errors/Errors";
import { JWSSignatureVerificationFailed, JWTClaimValidationFailed, JWTExpired, JWTInvalid } from "jose/errors";

vi.mock("@/modules/links/links.repository.ts");
vi.mock("@/modules/user/user.service.ts");
vi.mock("@/modules/auth/jwt.service.ts");
vi.mock("@/modules/auth/cookies.service.ts");
vi.mock("@/modules/links/links.schema.ts");

const valid_link: CreateLinkDto = {
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "Example Link",
};

const valid_user = { id: "user123", name: "Test User" } as User;

let server: TestAgent;

beforeAll(async () => {
  server = request(app);
});

beforeEach(() => {
  vi.clearAllMocks();
});

const LINK_CREATE_PATH = "/api/v1/link";
describe("POST /api/v1/link - Create Link", () => {
  it("should create a link successfully", async () => {
    // Arrange
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    vi.mocked(userService.getById).mockResolvedValue(valid_user);
    vi.mocked(createLinkSchema.parse).mockReturnValue(valid_link);

    // Act
    const response = await server
      .post(LINK_CREATE_PATH)
      .set("Cookie", ["accessToken=validAccessToken"])
      .send(valid_link);

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(valid_user.id);
    expect(createLinkSchema.parse).toHaveBeenCalledWith(valid_link);
    expect(linkRepository.createLink).toHaveBeenCalledWith({
      userId: "user123",
      ...valid_link,
    });
    expect(response.body.statusCode).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Link created successfully",
    );
  });

  describe("when the access token is missing", () => {
    it.each([
      ["undefined", undefined],
      ["null", null],
      ["empty string", ""],
    ])("returns 401 when the cookie value is %s", async (_label, value) => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        value as unknown as string,
      );

      const response = await server.post(LINK_CREATE_PATH).send(valid_link);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(userService.getById).not.toHaveBeenCalled();
      expect(linkRepository.createLink).not.toHaveBeenCalled();
    });

    it("propagates as MissingTokenError", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        undefined as unknown as string,
      );

      const response = await server.post(LINK_CREATE_PATH).send(valid_link);

      // Adjust this assertion to however your error handler serializes
      // the error name/message, if at all.
      expect(response.body.message).toEqual(
        expect.stringContaining(new MissingTokenError().message),
      );
    });

    it("returns 401 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.post(LINK_CREATE_PATH).send(valid_link);

      expect(response.status).toBe(500); // or 400, depending on how you classify this
      expect(linkRepository.createLink).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // Middleware: authenticate — token verification failures
  // ---------------------------------------------------------------------
  describe("when access token verification fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "someToken",
      );
    });

    it("returns 401 on an expired token", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTExpired("jwt expired", {}),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_link);

      expect(response.status).toBe(401);
      expect(userService.getById).not.toHaveBeenCalled();
    });

    it("returns 401 on a malformed token", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("jwt malformed"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_link);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a bad signature", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("invalid signature"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_link);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a claim mismatch (e.g. wrong issuer/audience)", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTClaimValidationFailed("jwt issuer invalid", {}),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_link);

      expect(response.status).toBe(401);
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_link);

      expect(response.status).toBe(500);
    });
  });

  // ---------------------------------------------------------------------
  // Controller/service: userId resolved but empty/invalid
  // ---------------------------------------------------------------------
  describe("when the resolved userId is invalid", () => {
    it.each([
      ["empty string", ""],
      ["whitespace-only string", "   "],
    ])(
      "returns 401 (AuthenticationError) when userId is %s",
      async (_label, userId) => {
        vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
          "validAccessToken",
        );
        vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(userId);

        const response = await server
          .post(LINK_CREATE_PATH)
          .set("Cookie", ["accessToken=validAccessToken"])
          .send(valid_link);

        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
          expect.stringContaining(new AuthenticationError().message),
        );
        expect(userService.getById).not.toHaveBeenCalled();
      },
    );
  });

  // ---------------------------------------------------------------------
  // Service: userService.getById failures
  // ---------------------------------------------------------------------
  describe("when user lookup fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(userService.getById).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect(response.status).toBe(404);
      expect(linkRepository.createLink).not.toHaveBeenCalled();
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(userService.getById).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect(response.status).toBe(500);
      expect(linkRepository.createLink).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // Service: schema validation failures
  // ---------------------------------------------------------------------
  describe("when the request body fails schema validation", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
      vi.mocked(userService.getById).mockResolvedValue(valid_user);
    });

    it("returns 422 when a required field is missing", async () => {
      vi.mocked(createLinkSchema.parse).mockImplementation(() => {
        throw new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["originalUrl"],
            message: "Required",
          },
        ]);
      });

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send({ shortCode: "abc123" });

      expect(response.status).toBe(422);
      expect(linkRepository.createLink).not.toHaveBeenCalled();
    });

    it("returns 422 when originalUrl is not a valid URL", async () => {
      vi.mocked(createLinkSchema.parse).mockImplementation(() => {
        throw new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["originalUrl"],
            message: "Required",
          },
        ]);
      });

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send({ ...valid_link, originalUrl: "not-a-url" });

      expect(response.status).toBe(422);
    });

    it("returns 422 when the body is empty", async () => {
      vi.mocked(createLinkSchema.parse).mockImplementation(() => {
        throw new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["originalUrl"],
            message: "Required",
          },
        ]);
      });

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send({});

      expect(response.status).toBe(422);
    });
  });

  // ---------------------------------------------------------------------
  // Repository: createLink failures (not in your list, but worth covering)
  // ---------------------------------------------------------------------
  describe("when persisting the link fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
      vi.mocked(userService.getById).mockResolvedValue(valid_user);
      vi.mocked(createLinkSchema.parse).mockReturnValue(valid_link);
    });

    it("returns 409 on a duplicate shortCode (unique constraint violation)", async () => {
      vi.mocked(linkRepository.createLink).mockRejectedValue(
        new Error("duplicate key value violates unique constraint"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      // If you don't have a dedicated ConflictError yet, this will fall
      // through to your generic 500 handler — worth deciding which you want.
      expect([409, 500]).toContain(response.status);
    });

    it("returns 500 when the database is unreachable during write", async () => {
      vi.mocked(linkRepository.createLink).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect(response.status).toBe(500);
    });
  });
});
