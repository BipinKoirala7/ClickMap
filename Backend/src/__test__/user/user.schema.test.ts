import { describe, expect, it } from "vitest";

// Adjust this import path to wherever these schemas are actually exported from.
import {
  publicUserSchema,
  updateUserSchema,
} from "@/modules/user/user.schema.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validSelectRow = {
  email: "test@example.com",
  name: "Test User",
  userName: "test_user123",
  plan: "free",
  isActive: true,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// publicUserSchema
// ---------------------------------------------------------------------------

describe("publicUserSchema", () => {
  it("accepts a fully valid row", () => {
    const result = publicUserSchema.safeParse(validSelectRow);
    expect(result.success).toBe(true);
  });

  it.each([
    "email",
    "name",
    "userName",
    "plan",
    "isActive",
    "isVerified",
    "createdAt",
    "updatedAt",
  ] as const)(
    "rejects a row missing '%s' (all columns are notNull)",
    (field) => {
      const { [field]: _omit, ...rest } = validSelectRow;
      const result = publicUserSchema.safeParse(rest);
      expect(result.success).toBe(false);
    },
  );

  it("strips id and password even if present on the raw row", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      id: "user_should_not_leak",
      password: "hashed_should_not_leak",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("password");
    }
  });

  it("rejects an invalid plan value", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      plan: "enterprise", // not in ["free", "pro", "business"]
    });
    expect(result.success).toBe(false);
  });

  it.each(["free", "pro", "business"] as const)(
    "accepts a valid plan value: '%s'",
    (plan) => {
      const result = publicUserSchema.safeParse({ ...validSelectRow, plan });
      expect(result.success).toBe(true);
    },
  );

  it("rejects a non-boolean isActive/isVerified", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-date createdAt/updatedAt", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      createdAt: "2027-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("does not enforce email format, trimming, or length limits (no overrides on select)", () => {
    // createSelectSchema was called with no per-field refinements, so email/
    // name/userName come back as plain strings straight from the DB row,
    // subject only to the varchar max-length auto-inferred by drizzle-zod.
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      email: "not-a-valid-email-but-thats-fine-for-select",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an email over the 255-char varchar limit", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      email: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name over the 100-char varchar limit", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a userName over the 100-char varchar limit", () => {
    const result = publicUserSchema.safeParse({
      ...validSelectRow,
      userName: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateUserSchema
// ---------------------------------------------------------------------------

describe("updateUserSchema", () => {
  it("accepts a payload with only name set", () => {
    const result = updateUserSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only userName set", () => {
    const result = updateUserSchema.safeParse({ userName: "new_user" });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only email set", () => {
    const result = updateUserSchema.safeParse({
      email: "new@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with all three fields set", () => {
    const result = updateUserSchema.safeParse({
      name: "New Name",
      userName: "new_user",
      email: "new@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object (at-least-one-field refine)", () => {
    const result = updateUserSchema.safeParse({});
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
    const result = updateUserSchema.safeParse({ isActive: false });
    expect(result.success).toBe(false);
  });

  describe("name", () => {
    it("rejects a name shorter than 5 characters", () => {
      const result = updateUserSchema.safeParse({ name: "Abcd" });
      expect(result.success).toBe(false);
    });

    it("accepts a name exactly at the 5 character minimum", () => {
      const result = updateUserSchema.safeParse({ name: "Abcde" });
      expect(result.success).toBe(true);
    });

    it("rejects a name longer than 100 characters", () => {
      const result = updateUserSchema.safeParse({ name: "a".repeat(101) });
      expect(result.success).toBe(false);
    });

    it("accepts a name exactly at the 100 character limit", () => {
      const result = updateUserSchema.safeParse({ name: "a".repeat(100) });
      expect(result.success).toBe(true);
    });

    it("trims before checking length (whitespace does not count toward min)", () => {
      // "  abcd  " is 8 raw chars but only 4 after trim — should fail min(5).
      const result = updateUserSchema.safeParse({ name: "  abcd  " });
      expect(result.success).toBe(false);
    });

    it("trims a valid name", () => {
      const result = updateUserSchema.safeParse({ name: "  Valid Name  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Valid Name");
      }
    });

    it("rejects a non-string name", () => {
      const result = updateUserSchema.safeParse({ name: 12345 });
      expect(result.success).toBe(false);
    });
  });

  describe("userName", () => {
    it("rejects an empty-after-trim userName", () => {
      const result = updateUserSchema.safeParse({ userName: "   " });
      expect(result.success).toBe(false);
    });

    it("rejects userName with spaces", () => {
      const result = updateUserSchema.safeParse({ userName: "new user" });
      expect(result.success).toBe(false);
    });

    it("rejects userName with special characters", () => {
      const result = updateUserSchema.safeParse({ userName: "new-user!" });
      expect(result.success).toBe(false);
    });

    it("accepts userName with only letters, numbers, and underscores", () => {
      const result = updateUserSchema.safeParse({
        userName: "New_User_99",
      });
      expect(result.success).toBe(true);
    });

    it("rejects userName longer than 100 characters", () => {
      const result = updateUserSchema.safeParse({
        userName: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts userName exactly at the 100 character limit", () => {
      const result = updateUserSchema.safeParse({
        userName: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("trims a valid userName", () => {
      const result = updateUserSchema.safeParse({
        userName: "  new_user  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userName).toBe("new_user");
      }
    });

    it("rejects a non-string userName", () => {
      const result = updateUserSchema.safeParse({ userName: 12345 });
      expect(result.success).toBe(false);
    });
  });

  describe("email", () => {
    it("rejects an invalid email format", () => {
      const result = updateUserSchema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("rejects an empty string email", () => {
      const result = updateUserSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
    });

    it("trims and lowercases a valid email", () => {
      const result = updateUserSchema.safeParse({
        email: "  MixedCase@Example.com  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("mixedcase@example.com");
      }
    });

    it("rejects a non-string email", () => {
      const result = updateUserSchema.safeParse({ email: 12345 });
      expect(result.success).toBe(false);
    });
  });

  describe("field allowlist (.pick)", () => {
    it("keeps name, userName, and email but strips everything else", () => {
      const result = updateUserSchema.safeParse({
        name: "New Name",
        userName: "new_user",
        email: "new@example.com",
        plan: "business",
        isActive: false,
        isVerified: true,
        id: "should-not-be-settable",
        password: "should-not-be-settable",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          name: "New Name",
          userName: "new_user",
          email: "new@example.com",
        });
      }
    });
  });
});
