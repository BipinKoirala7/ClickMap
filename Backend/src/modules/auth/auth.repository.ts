import { db } from "@/db/database.ts";
import { activeRefreshTokens } from "@/db/schema.ts";
import { eq, and } from "drizzle-orm";
import type { NewActiveRefreshToken } from "./auth.schema.ts";
import { AuthenticationError } from "@/errors/Errors.ts";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

async function setActiveRefreshToken(
  info: NewActiveRefreshToken,
  dbOrTx: DbOrTx = db,
) {
  return await dbOrTx
    .insert(activeRefreshTokens)
    .values(info)
    .onConflictDoUpdate({
      target: activeRefreshTokens.userId,
      set: info,
    });
}

async function getActiveRefreshToken(
  refreshToken: string,
  userId: string,
  dbOrTx: DbOrTx = db,
) {
  return await dbOrTx.query.activeRefreshTokens.findFirst({
    where: and(
      eq(activeRefreshTokens.refreshToken, refreshToken),
      eq(activeRefreshTokens.userId, userId),
    ),
  });
}

async function deleteActiveRefreshToken(userId: string) {
  return await db
    .delete(activeRefreshTokens)
    .where(eq(activeRefreshTokens.userId, userId));
}

async function rotateActiveRefreshToken(
  oldRefreshToken: string,
  info: NewActiveRefreshToken,
) {
  return await db.transaction(async (tx) => {
    const existing = await getActiveRefreshToken(
      oldRefreshToken,
      info.userId,
      tx,
    );
    if (!existing) {
      throw new AuthenticationError("Refresh token is not active");
    }
    return await setActiveRefreshToken(info, tx);
  });
}

export const authRepository = {
  setActiveRefreshToken,
  getActiveRefreshToken,
  deleteActiveRefreshToken,
  rotateActiveRefreshToken,
};
