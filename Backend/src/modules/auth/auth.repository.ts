import { db } from "@/db/database.ts";
import { activeRefreshTokens } from "@/db/schema.ts";
import { eq, and } from "drizzle-orm";
import type { NewActiveRefreshToken } from "./auth.schema.ts";

async function setActiveRefreshToken(info: NewActiveRefreshToken) {
  return await db.insert(activeRefreshTokens).values(info).onConflictDoUpdate({
    target: activeRefreshTokens.userId,
    set: info,
  });
}

async function getActiveRefreshToken(refreshToken: string, userId: string) {
  return await db.query.activeRefreshTokens.findFirst({
    where: and(
      eq(activeRefreshTokens.refreshToken, refreshToken),
      eq(activeRefreshTokens.userId, userId),
    ),
  });
}

export const authRepository = {
  setActiveRefreshToken,
  getActiveRefreshToken,
};
