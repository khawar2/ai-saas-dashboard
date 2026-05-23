import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { requiredEnv } from "@/lib/env";

const scrypt = promisify(scryptCallback);

export type SessionPayload = {
  userId: string;
  role: "owner" | "admin" | "member";
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export function createSessionToken(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", requiredEnv("AUTH_SECRET")).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function readSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", requiredEnv("AUTH_SECRET")).update(body).digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
}
