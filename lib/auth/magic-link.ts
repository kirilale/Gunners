import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";

const MAGIC_LINK_PREFIX = "magic-link:";
const MAGIC_LINK_EXPIRY = 15 * 60; // 15 minutes

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const key = `${MAGIC_LINK_PREFIX}${token}`;

  await redis.setex(key, MAGIC_LINK_EXPIRY, email);

  return token;
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  const key = `${MAGIC_LINK_PREFIX}${token}`;
  const email = await redis.get(key);

  if (email) {
    // Delete token after use (one-time use)
    await redis.del(key);
  }

  return email;
}

export function generateMagicLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/auth/verify?token=${token}`;
}
