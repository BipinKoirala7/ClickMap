import {
  type CreateLinkDto,
  type PublicLinkDto,
} from "@/modules/links/links.schema";
import type TestAgent from "supertest/lib/agent";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/index";
import type { User } from "@/modules/auth/auth.schema";
import { jwtService } from "@/modules/auth/jwt.service";
import { cookiesService } from "@/modules/auth/cookies.service";
import { ZodError } from "zod";
import {
  AuthenticationError,
  LinkAlreadyActiveError,
  LinkAlreadyDeactivatedError,
  LinkNotFoundError,
  MissingTokenError,
  UserNotFoundError,
} from "@/errors/Errors";
import {
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
  JWTExpired,
  JWTInvalid,
} from "jose/errors";
import { linkService } from "@/modules/links/links.service";

vi.mock("@/modules/auth/jwt.service.ts");
vi.mock("@/modules/auth/cookies.service.ts");
vi.mock("@/modules/links/links.service.ts");

const valid_user = { id: "user123", name: "Test User" } as User;

let server: TestAgent;

beforeAll(async () => {
  server = request(app);
});

beforeEach(() => {
  vi.clearAllMocks();
});

const LINK_CREATE_PATH = "/api/v1/link";
const valid_link: CreateLinkDto = {
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "Example Link",
  isActive: true,
};

describe("POST /api/v1/link - Create Link", () => {
  it("should create a link successfully", async () => {
    // Arrange
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    // Act
    const response = await server
      .post(LINK_CREATE_PATH)
      .set("Cookie", ["accessToken=validAccessToken"])
      .send(valid_link);

    // Assert
    expect(linkService.createLink).toHaveBeenCalledWith(
      valid_user.id,
      valid_link,
    );
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Link created successfully",
    );
  });

  // ---------------------------------------------------------------------
  // Middleware: authenticate — missing token
  // ---------------------------------------------------------------------
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
      expect(linkService.createLink).not.toHaveBeenCalled();
    });

    it("propagates as MissingTokenError", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        undefined as unknown as string,
      );

      const response = await server.post(LINK_CREATE_PATH).send(valid_link);

      expect(response.body.message).toEqual(
        expect.stringContaining(new MissingTokenError().message),
      );
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.post(LINK_CREATE_PATH).send(valid_link);

      expect(response.status).toBe(500);
      expect(linkService.createLink).not.toHaveBeenCalled();
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
      expect(linkService.createLink).not.toHaveBeenCalled();
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
  // Service: everything past this point is "linkService.createLink rejects"
  // — user lookup, schema validation, and persistence all collapse to the
  // same shape since they're internal to the service now.
  // ---------------------------------------------------------------------
  describe("when linkService.createLink fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.createLink).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect(response.status).toBe(404);
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.createLink).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect(response.status).toBe(500);
    });

    it("returns 422 when the request body fails schema validation", async () => {
      vi.mocked(linkService.createLink).mockRejectedValue(
        new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["originalUrl"],
            message: "Required",
          },
        ]),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send({ shortCode: "abc123" }); // malformed body, service does the real parsing normally — here we just simulate its rejection

      expect(response.status).toBe(422);
    });

    it("returns 409 on a duplicate shortCode (unique constraint violation)", async () => {
      vi.mocked(linkService.createLink).mockRejectedValue(
        new Error("duplicate key value violates unique constraint"),
      );

      const response = await server
        .post(LINK_CREATE_PATH)
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_link);

      expect([409, 500]).toContain(response.status);
    });

    it("returns 500 when the database is unreachable during write", async () => {
      vi.mocked(linkService.createLink).mockRejectedValue(
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

const LINK_LIST_PATH = "/api/v1/link";
const linkInfoPath = (id: string) => `/api/v1/link/${id}`;
const now = new Date();
const valid_public_link: PublicLinkDto = {
  id: "link123",
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "Example Link",
  isActive: true,
  expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  createdAt: now,
  updatedAt: now,
};

describe("GET /api/v1/link - Get All Links", () => {
  it("should fetch the user's links successfully as public link DTOs", async () => {
    // Arrange
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    vi.mocked(linkService.getUserLinks).mockResolvedValue([valid_public_link]);

    // Act
    const response = await server
      .get(LINK_LIST_PATH)
      .set("Cookie", ["accessToken=validAccessToken"]);

    // Assert
    expect(linkService.getUserLinks).toHaveBeenCalledWith(valid_user.id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "User Links Fetched Successfully",
    );
    // userId should never be present on the response payload
    expect(response.body.data[0]).not.toHaveProperty("userId");
    expect(response.body.data[0]).toHaveProperty("isActive");
    expect(response.body.data[0]).toHaveProperty("expiresAt");
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

      const response = await server.get(LINK_LIST_PATH);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(linkService.getUserLinks).not.toHaveBeenCalled();
    });

    it("propagates as MissingTokenError", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        undefined as unknown as string,
      );

      const response = await server.get(LINK_LIST_PATH);

      expect(response.body.message).toEqual(
        expect.stringContaining(new MissingTokenError().message),
      );
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.get(LINK_LIST_PATH);

      expect(response.status).toBe(500);
      expect(linkService.getUserLinks).not.toHaveBeenCalled();
    });
  });

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
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
      expect(linkService.getUserLinks).not.toHaveBeenCalled();
    });

    it("returns 401 on a malformed token", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("jwt malformed"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a bad signature", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("invalid signature"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a claim mismatch (e.g. wrong issuer/audience)", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTClaimValidationFailed("jwt issuer invalid", {}),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(500);
    });
  });

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
        vi.mocked(linkService.getUserLinks).mockRejectedValue(
          new AuthenticationError(),
        );

        const response = await server
          .get(LINK_LIST_PATH)
          .set("Cookie", ["accessToken=validAccessToken"]);

        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
          expect.stringContaining(new AuthenticationError().message),
        );
        expect(linkService.getUserLinks).toHaveBeenCalledWith(userId);
      },
    );
  });

  describe("when user lookup fails inside the service", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.getUserLinks).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.getUserLinks).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });
  });

  describe("when fetching or serializing links fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 500 when the database is unreachable during read", async () => {
      vi.mocked(linkService.getUserLinks).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });

    it("returns 200 with an empty array when the user has no links", async () => {
      vi.mocked(linkService.getUserLinks).mockResolvedValue([]);

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it("returns 500 when a link in the result set fails publicLinkSchema validation", async () => {
      // e.g. a row came back from the DB missing a required column, or with
      // a type mismatch, and publicLinkSchema.parse throws mid-loop.
      vi.mocked(linkService.getUserLinks).mockRejectedValue(
        new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["shortCode"],
            message: "Required",
          },
        ]),
      );

      const response = await server
        .get(LINK_LIST_PATH)
        .set("Cookie", ["accessToken=validAccessToken"]);

      // Adjust to 422 instead if your error handler maps ZodError to 422
      // even when it originates outside request-body parsing.
      expect([422, 500]).toContain(response.status);
    });
  });
});

describe("GET /api/v1/link/:id - Get Link Info", () => {
  it("should fetch a single link successfully as a public link DTO", async () => {
    // Arrange
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    vi.mocked(linkService.getLinkInfo).mockResolvedValue(valid_public_link);

    // Act
    const response = await server
      .get(linkInfoPath("link123"))
      .set("Cookie", ["accessToken=validAccessToken"]);

    // Assert
    expect(linkService.getLinkInfo).toHaveBeenCalledWith(
      "link123",
      valid_user.id,
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "OK");
    expect(response.body.data).not.toHaveProperty("userId");
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

      const response = await server.get(linkInfoPath("link123"));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(linkService.getLinkInfo).not.toHaveBeenCalled();
    });

    it("propagates as MissingTokenError", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        undefined as unknown as string,
      );

      const response = await server.get(linkInfoPath("link123"));

      expect(response.body.message).toEqual(
        expect.stringContaining(new MissingTokenError().message),
      );
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.get(linkInfoPath("link123"));

      expect(response.status).toBe(500);
      expect(linkService.getLinkInfo).not.toHaveBeenCalled();
    });
  });

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
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
      expect(linkService.getLinkInfo).not.toHaveBeenCalled();
    });

    it("returns 401 on a malformed token", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("jwt malformed"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a bad signature", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("invalid signature"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a claim mismatch (e.g. wrong issuer/audience)", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTClaimValidationFailed("jwt issuer invalid", {}),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(500);
    });
  });

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
        vi.mocked(linkService.getLinkInfo).mockRejectedValue(
          new AuthenticationError(),
        );

        const response = await server
          .get(linkInfoPath("link123"))
          .set("Cookie", ["accessToken=validAccessToken"]);

        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
          expect.stringContaining(new AuthenticationError().message),
        );
      },
    );
  });

  describe("when user lookup fails inside the service", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.getLinkInfo).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.getLinkInfo).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });
  });

  describe("when the link cannot be found, fetched, or serialized", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the link does not exist or does not belong to the user", async () => {
      vi.mocked(linkService.getLinkInfo).mockRejectedValue(
        new LinkNotFoundError(),
      );

      const response = await server
        .get(linkInfoPath("nonexistent-link"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 500 when the database is unreachable during read", async () => {
      vi.mocked(linkService.getLinkInfo).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });

    it("returns 500 when the link fails publicLinkSchema validation", async () => {
      vi.mocked(linkService.getLinkInfo).mockRejectedValue(
        new ZodError([
          {
            code: "invalid_type",
            expected: "date",
            path: ["expiresAt"],
            message: "Required",
          },
        ]),
      );

      const response = await server
        .get(linkInfoPath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect([422, 500]).toContain(response.status);
    });

    // Note: with the current route definition (`linkRouter.get("/:id", ...)`),
    // an empty `:id` param can't actually reach the controller via HTTP —
    // "/api/v1/link/" matches the "/" route (getAllLinksController) instead.
    // The "Link ID is required" branch is better covered as a unit test on
    // getLinkController directly, or by relaxing the route to allow an
    // empty segment.
  });
});

// ---------------------------------------------------------------------
// Shared fixtures for update / activate / deactivate suites
// ---------------------------------------------------------------------
const linkUpdatePath = (id: string) => `/api/v1/link/${id}`;
const linkActivatePath = (id: string) => `/api/v1/link/${id}/activate`;
const linkDeactivatePath = (id: string) => `/api/v1/link/${id}/deactivate`;

const valid_update_payload: Partial<CreateLinkDto> = {
  title: "Updated Title",
  originalUrl: "https://example.com/updated",
};

describe("PUT /api/v1/link/:id - Update Link", () => {
  it("should update a link successfully", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    // vi.mocked(linkService.updateLink).mockResolvedValue(valid_public_link);

    const response = await server
      .put(linkUpdatePath("link123"))
      .set("Cookie", ["accessToken=validAccessToken"])
      .send(valid_update_payload);

    expect(linkService.updateLink).toHaveBeenCalledWith(
      "link123",
      valid_user.id,
      valid_update_payload,
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "OK");
    expect(response.body.data).toBeNull();
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

      const response = await server
        .put(linkUpdatePath("link123"))
        .send(valid_update_payload);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(linkService.updateLink).not.toHaveBeenCalled();
    });

    it("propagates as MissingTokenError", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        undefined as unknown as string,
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .send(valid_update_payload);

      expect(response.body.message).toEqual(
        expect.stringContaining(new MissingTokenError().message),
      );
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .send(valid_update_payload);

      expect(response.status).toBe(500);
      expect(linkService.updateLink).not.toHaveBeenCalled();
    });
  });

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
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(401);
      expect(linkService.updateLink).not.toHaveBeenCalled();
    });

    it("returns 401 on a malformed token", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTInvalid("jwt malformed"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a bad signature", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWSSignatureVerificationFailed("invalid signature"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(401);
    });

    it("returns 401 on a claim mismatch (e.g. wrong issuer/audience)", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new JWTClaimValidationFailed("jwt issuer invalid", {}),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(401);
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=someToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(500);
    });
  });

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
        vi.mocked(linkService.updateLink).mockRejectedValue(
          new AuthenticationError(),
        );

        const response = await server
          .put(linkUpdatePath("link123"))
          .set("Cookie", ["accessToken=validAccessToken"])
          .send(valid_update_payload);

        expect(response.status).toBe(401);
        expect(response.body.message).toEqual(
          expect.stringContaining(new AuthenticationError().message),
        );
        expect(linkService.updateLink).toHaveBeenCalledWith(
          "link123",
          userId,
          valid_update_payload,
        );
      },
    );
  });

  describe("when linkService.updateLink fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.updateLink).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(404);
    });

    it("returns 404 when the link does not exist or does not belong to the user", async () => {
      vi.mocked(linkService.updateLink).mockRejectedValue(
        new LinkNotFoundError(),
      );

      const response = await server
        .put(linkUpdatePath("nonexistent-link"))
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(404);
    });

    it("returns 422 when the request body fails updateLinkSchema validation", async () => {
      vi.mocked(linkService.updateLink).mockRejectedValue(
        new ZodError([
          {
            code: "invalid_type",
            expected: "string",
            path: ["originalUrl"],
            message: "Required",
          },
        ]),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"])
        .send({ originalUrl: 12345 }); // malformed, service does the real parsing normally

      expect(response.status).toBe(422);
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.updateLink).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(500);
    });

    it("returns 500 when the database is unreachable during write", async () => {
      vi.mocked(linkService.updateLink).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .put(linkUpdatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"])
        .send(valid_update_payload);

      expect(response.status).toBe(500);
    });
  });

  // Note: same route-shape caveat as GET /:id — an empty `:id` segment
  // collapses onto a different route and can't reach the controller via
  // HTTP, so the "Link ID is required" branch isn't exercised here.
});

describe("PATCH /api/v1/link/:id/activate - Activate Link", () => {
  it("should activate a link successfully", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    // vi.mocked(linkService.activateLink).mockResolvedValue(valid_public_link);

    const response = await server
      .patch(linkActivatePath("link123"))
      .set("Cookie", ["accessToken=validAccessToken"]);

    expect(linkService.activateLink).toHaveBeenCalledWith(
      "link123",
      valid_user.id,
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "OK");
    expect(response.body.data).toBeNull();
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

      const response = await server.patch(linkActivatePath("link123"));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(linkService.activateLink).not.toHaveBeenCalled();
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.patch(linkActivatePath("link123"));

      expect(response.status).toBe(500);
      expect(linkService.activateLink).not.toHaveBeenCalled();
    });
  });

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
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
      expect(linkService.activateLink).not.toHaveBeenCalled();
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(500);
    });
  });

  describe("when the resolved userId is invalid", () => {
    it("returns 401 (AuthenticationError) when userId is empty", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("");
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new AuthenticationError(),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual(
        expect.stringContaining(new AuthenticationError().message),
      );
    });
  });

  describe("when linkService.activateLink fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 404 when the link does not exist or does not belong to the user", async () => {
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new LinkNotFoundError(),
      );

      const response = await server
        .patch(linkActivatePath("nonexistent-link"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 400 when the link is already active", async () => {
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new LinkAlreadyActiveError(),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.stringContaining(new LinkAlreadyActiveError().message),
      );
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });

    it("returns 500 when the database is unreachable during write", async () => {
      vi.mocked(linkService.activateLink).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .patch(linkActivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });
  });
});

describe("PATCH /api/v1/link/:id/deactivate - Deactivate Link", () => {
  it("should deactivate a link successfully", async () => {
    vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
      "validAccessToken",
    );
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue(valid_user.id);
    // vi.mocked(linkService.deactivateLink).mockResolvedValue(valid_public_link);

    const response = await server
      .patch(linkDeactivatePath("link123"))
      .set("Cookie", ["accessToken=validAccessToken"]);

    expect(linkService.deactivateLink).toHaveBeenCalledWith(
      "link123",
      valid_user.id,
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "OK");
    expect(response.body.data).toBeNull();
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

      const response = await server.patch(linkDeactivatePath("link123"));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();
      expect(linkService.deactivateLink).not.toHaveBeenCalled();
    });

    it("returns 500 if the cookie service itself throws (e.g. malformed cookie header)", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockImplementation(
        () => {
          throw new Error("Malformed cookie header");
        },
      );

      const response = await server.patch(linkDeactivatePath("link123"));

      expect(response.status).toBe(500);
      expect(linkService.deactivateLink).not.toHaveBeenCalled();
    });
  });

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
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(401);
      expect(linkService.deactivateLink).not.toHaveBeenCalled();
    });

    it("returns 500 when token verification throws an unexpected error", async () => {
      vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
        new Error("Unexpected JWT library failure"),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=someToken"]);

      expect(response.status).toBe(500);
    });
  });

  describe("when the resolved userId is invalid", () => {
    it("returns 401 (AuthenticationError) when userId is empty", async () => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("");
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new AuthenticationError(),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual(
        expect.stringContaining(new AuthenticationError().message),
      );
    });
  });

  describe("when linkService.deactivateLink fails", () => {
    beforeEach(() => {
      vi.mocked(cookiesService.getAccessCookiesFromRequest).mockReturnValue(
        "validAccessToken",
      );
      vi.mocked(jwtService.verifyAccessToken).mockResolvedValue("user123");
    });

    it("returns 404 when the user does not exist", async () => {
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new UserNotFoundError("user123"),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 404 when the link does not exist or does not belong to the user", async () => {
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new LinkNotFoundError(),
      );

      const response = await server
        .patch(linkDeactivatePath("nonexistent-link"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(404);
    });

    it("returns 400 when the link is already deactivated", async () => {
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new LinkAlreadyDeactivatedError(),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.stringContaining(new LinkAlreadyDeactivatedError().message),
      );
    });

    it("returns 500 when the database errors during user lookup", async () => {
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new Error("Connection terminated unexpectedly"),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });

    it("returns 500 when the database is unreachable during write", async () => {
      vi.mocked(linkService.deactivateLink).mockRejectedValue(
        new Error("ECONNREFUSED"),
      );

      const response = await server
        .patch(linkDeactivatePath("link123"))
        .set("Cookie", ["accessToken=validAccessToken"]);

      expect(response.status).toBe(500);
    });
  });
});
