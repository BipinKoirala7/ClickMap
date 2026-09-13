import { describe, expect, it } from "vitest";
import {
  activeRefreshTokenSchema,
  loginUserSchema,
  registerUserSchema,
  type ActiveRefreshTokenDto,
  type LoginUserDto,
  type RegisterUserDto,
} from "@/modules/auth/auth.schema.ts";

const validRegisterInput = {
  email: "Test@Example.com",
  password: "Password1",
  name: "Test User",
  userName: "test_user123",
};

const validLoginInput = {
  email: "Test@Example.com",
  password: "anything",
};

const futureDate = new Date(Date.now() + 1000 * 60 * 60); // +1 hour
const pastDate = new Date(Date.now() - 1000 * 60 * 60); // -1 hour

const validRefreshTokenInput = {
  userId: "user_123",
  refreshToken: "refresh_abc",
  expiresAt: futureDate,
};

// ---------------------------------------------------------------------------
// registerUserSchema
// ---------------------------------------------------------------------------

describe("registerUserSchema", () => {
  it("accepts a fully valid payload", () => {
    const result = registerUserSchema.safeParse(validRegisterInput);
    expect(result.success).toBe(true);
  });

  describe("email", () => {
    it("rejects an invalid email format", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing email", () => {
      // const { email, ...rest } = validRegisterInput;
      const rest: RegisterUserDto = {
        ...validRegisterInput,
        email: undefined as unknown as string, // Force email to be undefined
      };
      const result = registerUserSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("trims and lowercases a valid email", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        email: "  MixedCase@Example.com  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("mixedcase@example.com");
      }
    });

    it("rejects an empty string email", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        email: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("password", () => {
    it("rejects a password shorter than 8 characters", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "Pass1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a password longer than 255 characters", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "A1" + "a".repeat(255),
      });
      expect(result.success).toBe(false);
    });

    it("rejects a password with no uppercase letter", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "password1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a password with no lowercase letter", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "PASSWORD1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a password with no number", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "PasswordOnly",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing password", () => {
      const rest: RegisterUserDto = {
        ...validRegisterInput,
        password: undefined as unknown as string, // Force password to be undefined
      };
      const result = registerUserSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects a non-string password", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: 12345678,
      });
      expect(result.success).toBe(false);
    });

    it("accepts a password exactly at the 8 character minimum", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password: "Passwor1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a password exactly at the 255 character maximum", () => {
      const password = "Aa1" + "a".repeat(252); // length 255
      expect(password.length).toBe(255);
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        password,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("name", () => {
    it("rejects an empty name", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing name", () => {
      const rest: RegisterUserDto = {
        ...validRegisterInput,
        name: undefined as unknown as string, // Force name to be undefined
      };
      const result = registerUserSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("trims a valid name", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        name: "  Test User  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test User");
      }
    });

    it("rejects a name over 100 characters (varchar length)", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a name exactly at the 100 character limit", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        name: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("userName", () => {
    it("rejects an empty userName", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing userName", () => {
      const rest: RegisterUserDto = {
        ...validRegisterInput,
        userName: undefined as unknown as string, // Force userName to be undefined
      };
      const result = registerUserSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects userName with spaces", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "test user",
      });
      expect(result.success).toBe(false);
    });

    it("rejects userName with special characters", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "test-user!",
      });
      expect(result.success).toBe(false);
    });

    it("accepts userName with only letters, numbers, and underscores", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "Test_User_99",
      });
      expect(result.success).toBe(true);
    });

    it("rejects userName longer than 100 characters", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("accepts userName exactly at the 100 character limit", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("trims a valid userName", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        userName: "  test_user  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userName).toBe("test_user");
      }
    });
  });

  describe("field allowlist (.pick)", () => {
    it("strips fields not in the pick list (e.g. plan, isActive)", () => {
      const result = registerUserSchema.safeParse({
        ...validRegisterInput,
        plan: "business",
        isActive: false,
        id: "should-not-be-settable",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("plan");
        expect(result.data).not.toHaveProperty("isActive");
        expect(result.data).not.toHaveProperty("id");
      }
    });
  });
});

// ---------------------------------------------------------------------------
// loginUserSchema
// ---------------------------------------------------------------------------

describe("loginUserSchema", () => {
  it("accepts a valid payload", () => {
    const result = loginUserSchema.safeParse(validLoginInput);
    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = loginUserSchema.safeParse({
      ...validLoginInput,
      email: "  MixedCase@Example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("mixedcase@example.com");
    }
  });

  it("rejects an invalid email format", () => {
    const result = loginUserSchema.safeParse({
      ...validLoginInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const rest: LoginUserDto = {
      ...validLoginInput,
      email: undefined as unknown as string, // Force email to be undefined
    };
    const result = loginUserSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginUserSchema.safeParse({
      ...validLoginInput,
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing password", () => {
    // const { password, ...rest } = validLoginInput;
    const rest: LoginUserDto = {
      ...validLoginInput,
      password: undefined as unknown as string, // Force password to be undefined
    };
    const result = loginUserSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a non-string password", () => {
    const result = loginUserSchema.safeParse({
      ...validLoginInput,
      password: 12345,
    });
    expect(result.success).toBe(false);
  });

  it("does NOT enforce the registration password complexity rules", () => {
    // Login should accept any non-empty password (e.g. a legacy weak password),
    // since it only checks credentials, not password policy.
    const result = loginUserSchema.safeParse({
      ...validLoginInput,
      password: "short",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// activeRefreshTokenSchema
// ---------------------------------------------------------------------------

describe("activeRefreshTokenSchema", () => {
  it("accepts a valid payload", () => {
    const result = activeRefreshTokenSchema.safeParse(validRefreshTokenInput);
    expect(result.success).toBe(true);
  });

  describe("userId", () => {
    it("rejects an empty userId", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        userId: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing userId", () => {
      const rest: ActiveRefreshTokenDto = {
        ...validRefreshTokenInput,
        userId: undefined as unknown as string, // Force userId to be undefined
      };
      const result = activeRefreshTokenSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("trims a valid userId", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        userId: "  user_123  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe("user_123");
      }
    });
  });

  describe("refreshToken", () => {
    it("rejects an empty refreshToken", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        refreshToken: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a missing refreshToken", () => {
      const rest: ActiveRefreshTokenDto = {
        ...validRefreshTokenInput,
        refreshToken: undefined as unknown as string, // Force refreshToken to be undefined
      };
      const result = activeRefreshTokenSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("trims a valid refreshToken", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        refreshToken: "  refresh_abc  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.refreshToken).toBe("refresh_abc");
      }
    });
  });

  describe("expiresAt", () => {
    it("rejects a date in the past", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        expiresAt: pastDate,
      });
      expect(result.success).toBe(false);
    });

    it("rejects a date that is exactly now (not strictly in the future)", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        expiresAt: new Date(),
      });
      expect(result.success).toBe(false);
    });

    it("accepts a date in the future", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        expiresAt: futureDate,
      });
      expect(result.success).toBe(true);
    });

    it("rejects a missing expiresAt", () => {
      const rest: ActiveRefreshTokenDto = {
        ...validRefreshTokenInput,
        expiresAt: undefined as unknown as Date, // Force expiresAt to be undefined
      };
      const result = activeRefreshTokenSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects a non-date value", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        expiresAt: "not-a-date",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("field allowlist (.pick)", () => {
    it("strips fields not in the pick list (e.g. id, createdAt)", () => {
      const result = activeRefreshTokenSchema.safeParse({
        ...validRefreshTokenInput,
        id: "should-not-be-settable",
        createdAt: new Date(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("id");
        expect(result.data).not.toHaveProperty("createdAt");
      }
    });
  });
});
