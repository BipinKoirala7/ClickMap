import { config } from "@/config/config";
import bcrypt from "bcryptjs";

async function hashPassword(rawPassword: string): Promise<string> {
  return await bcrypt.hash(rawPassword, config.BCRYPT_SALT_ROUNDS);
}

async function verifyPassword(
  rawPassword: string,
  hashPassword: string,
): Promise<boolean> {
  return bcrypt.compare(rawPassword, hashPassword);
}

export const password = { hashPassword, verifyPassword };
