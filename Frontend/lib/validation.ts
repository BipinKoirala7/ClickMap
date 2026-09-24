import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters long")
    .max(50, "Name must be less than 50 characters long"),
  userName: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Username is required"
          : "Username must be a string",
    })
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username cannot be more than 50 characters long")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z
    .string("Email must be a string")
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email address")),
  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password cannot be more than 255 characters long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9\s]/, "Password must contain a special character"),
});

const loginSchema = z.object({
  email: z
    .string("Email must be a string")
    .trim()
    .toLowerCase()
    .nonempty("Email is required")
    .pipe(z.email("Invalid email address")),
  password: z.string().nonempty("Password cannot be empty"),
});

export { loginSchema, registerSchema };
