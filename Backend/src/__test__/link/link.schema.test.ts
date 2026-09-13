import { describe, expect, it } from "vitest";

// Adjust this import path to wherever these schemas are actually exported from.
import {
  createLinkSchema,
  publicLinkSchema,
  updateLinkSchema,
  type CreateLinkDto,
} from "@/modules/links/links.schema.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const futureDate = new Date(Date.now() + 1000 * 60 * 60); // +1 hour
const pastDate = new Date(Date.now() - 1000 * 60 * 60); // -1 hour

const validCreateInput = {
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "My Link",
};

const validSelectRow = {
  id: "link_abc",
  shortCode: "abc123",
  originalUrl: "https://example.com",
  title: "My Link",
  isActive: true,
  expiresAt: futureDate,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// createLinkSchema
// ---------------------------------------------------------------------------

describe("createLinkSchema", () => {
  it("accepts a minimal valid payload (only required fields)", () => {
    const result = createLinkSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it("accepts a full valid payload including optional fields", () => {
    const result = createLinkSchema.safeParse({
      ...validCreateInput,
      isActive: false,
      expiresAt: futureDate,
    });
    expect(result.success).toBe(true);
  });

  describe("shortCode", () => {
    it("rejects a missing shortCode", () => {
      const rest: CreateLinkDto = {
        ...validCreateInput,
        shortCode: undefined as unknown as string, // Force it to be undefined for the test
      };
      const result = createLinkSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects a non-string shortCode", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        shortCode: 12345,
      });
      expect(result.success).toBe(false);
    });

    it("trims a valid shortCode", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        shortCode: "  abc123  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shortCode).toBe("abc123");
      }
    });
  });

  describe("originalUrl", () => {
    it("rejects a missing originalUrl", () => {
      const rest: CreateLinkDto = {
        ...validCreateInput,
        originalUrl: undefined as unknown as string, // Force it to be undefined for the test
      };
      const result = createLinkSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects a non-URL string", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        originalUrl: "not a url",
      });
      expect(result.success).toBe(false);
    });

    it("rejects an empty string", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        originalUrl: "",
      });
      expect(result.success).toBe(false);
    });

    it("trims and accepts a valid URL with surrounding whitespace", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        originalUrl: "  https://example.com/path?query=1  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originalUrl).toBe(
          "https://example.com/path?query=1",
        );
      }
    });

    it("accepts URLs with different valid schemes (e.g. http)", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        originalUrl: "http://example.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("title", () => {
    it("rejects a missing title", () => {
      const rest: CreateLinkDto = {
        ...validCreateInput,
        title: undefined as unknown as string, // Force it to be undefined for the test
      };
      const result = createLinkSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects a non-string title", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        title: 42,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("isActive", () => {
    it("is optional — omitting it succeeds", () => {
      const result = createLinkSchema.safeParse(validCreateInput);
      expect(result.success).toBe(true);
      if (result.success) {
        // No `.default()` is configured on the Zod schema, so the parsed
        // output simply omits the key — the DB-level default(true) is
        // applied by Postgres, not by this validator.
        expect(result.data.isActive).toBeUndefined();
      }
    });

    it("accepts true", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it("accepts false", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        isActive: false,
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-boolean value", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        isActive: "yes",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("expiresAt", () => {
    it("is optional — omitting it succeeds", () => {
      const result = createLinkSchema.safeParse(validCreateInput);
      expect(result.success).toBe(true);
      if (result.success) {
        // Same as isActive: the DB-level $default (now + 30 days) is not
        // replicated by the Zod schema, so an omitted expiresAt parses to
        // undefined, not a computed date.
        expect(result.data.expiresAt).toBeUndefined();
      }
    });

    it("rejects a date in the past", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        expiresAt: pastDate,
      });
      expect(result.success).toBe(false);
    });

    it("rejects a date that is exactly now", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        expiresAt: new Date(),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a date in the future", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        expiresAt: futureDate,
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-date value", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        expiresAt: "2027-01-01",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("field allowlist (.omit)", () => {
    it("strips id, userId, createdAt, and updatedAt if present", () => {
      const result = createLinkSchema.safeParse({
        ...validCreateInput,
        id: "should-not-be-settable",
        userId: "should-not-be-settable",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("id");
        expect(result.data).not.toHaveProperty("userId");
        expect(result.data).not.toHaveProperty("createdAt");
        expect(result.data).not.toHaveProperty("updatedAt");
      }
    });
  });
});

// ---------------------------------------------------------------------------
// publicLinkSchema
// ---------------------------------------------------------------------------

describe("publicLinkSchema", () => {
  it("accepts a fully valid row", () => {
    const result = publicLinkSchema.safeParse(validSelectRow);
    expect(result.success).toBe(true);
  });

  it.each([
    "id",
    "shortCode",
    "originalUrl",
    "title",
    "isActive",
    "expiresAt",
    "createdAt",
    "updatedAt",
  ] as const)(
    "rejects a row missing '%s' (all columns are notNull)",
    (field) => {
      const { [field]: _omit, ...rest } = validSelectRow;
      const result = publicLinkSchema.safeParse(rest);
      expect(result.success).toBe(false);
    },
  );

  it("rejects a non-boolean isActive", () => {
    const result = publicLinkSchema.safeParse({
      ...validSelectRow,
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-date expiresAt/createdAt/updatedAt", () => {
    const result = publicLinkSchema.safeParse({
      ...validSelectRow,
      expiresAt: "2027-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("strips userId even if present on the raw row", () => {
    const result = publicLinkSchema.safeParse({
      ...validSelectRow,
      userId: "user_should_not_leak",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("userId");
    }
  });

  it("does not enforce URL format or trimming (no overrides on select)", () => {
    // createSelectSchema was called with no per-field refinements, so
    // shortCode/originalUrl/title come back as plain strings straight
    // from the DB row without any additional validation.
    const result = publicLinkSchema.safeParse({
      ...validSelectRow,
      originalUrl: "not-a-valid-url-but-thats-fine-for-select",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateLinkSchema
// ---------------------------------------------------------------------------

describe("updateLinkSchema", () => {
  it("accepts a payload with a single field set", () => {
    const result = updateLinkSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with multiple fields set", () => {
    const result = updateLinkSchema.safeParse({
      title: "New title",
      shortCode: "new_code",
      originalUrl: "https://example.com/new",
      expiresAt: futureDate,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object (at-least-one-field refine)", () => {
    const result = updateLinkSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "At least one field must be provided to update",
      );
    }
  });

  it("rejects a payload containing only non-picked fields (e.g. isActive)", () => {
    // isActive isn't in the .pick() list, so it gets stripped before the
    // refine runs, leaving an effectively empty object.
    const result = updateLinkSchema.safeParse({ isActive: false });
    expect(result.success).toBe(false);
  });

  describe("shortCode", () => {
    it("is optional — omitting it succeeds as long as another field is set", () => {
      const result = updateLinkSchema.safeParse({ title: "New title" });
      expect(result.success).toBe(true);
    });

    it("trims a valid shortCode", () => {
      const result = updateLinkSchema.safeParse({
        shortCode: "  new_code  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shortCode).toBe("new_code");
      }
    });

    it("rejects an empty-after-trim shortCode (min(1)/nonempty() enforced here)", () => {
      const result = updateLinkSchema.safeParse({ shortCode: "   " });
      expect(result.success).toBe(false);
    });

    it("rejects a non-string shortCode", () => {
      const result = updateLinkSchema.safeParse({ shortCode: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe("originalUrl", () => {
    it("trims and accepts a valid URL", () => {
      const result = updateLinkSchema.safeParse({
        originalUrl: "  https://example.com/updated  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originalUrl).toBe("https://example.com/updated");
      }
    });

    it("rejects an invalid URL", () => {
      const result = updateLinkSchema.safeParse({
        originalUrl: "not a url",
      });
      expect(result.success).toBe(false);
    });

    it("rejects an empty string", () => {
      const result = updateLinkSchema.safeParse({ originalUrl: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("title", () => {
    it("trims a valid title", () => {
      const result = updateLinkSchema.safeParse({ title: "  New title  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("New title");
      }
    });
  });

  describe("expiresAt", () => {
    it("rejects a date in the past", () => {
      const result = updateLinkSchema.safeParse({ expiresAt: pastDate });
      expect(result.success).toBe(false);
    });

    it("accepts a date in the future", () => {
      const result = updateLinkSchema.safeParse({ expiresAt: futureDate });
      expect(result.success).toBe(true);
    });

    it("rejects a non-date value", () => {
      const result = updateLinkSchema.safeParse({
        expiresAt: "2027-01-01",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("field allowlist (.pick)", () => {
    it("strips fields not in the pick list (e.g. isActive, userId, id)", () => {
      const result = updateLinkSchema.safeParse({
        title: "New title",
        isActive: false,
        userId: "should-not-be-settable",
        id: "should-not-be-settable",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("isActive");
        expect(result.data).not.toHaveProperty("userId");
        expect(result.data).not.toHaveProperty("id");
      }
    });
  });
});
