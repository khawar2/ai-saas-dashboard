export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type UserRole = "user" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type SessionPayload = {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing required environment variable: AUTH_SECRET");
  }

  if (secret.length < 32 || secret.includes("replace-with")) {
    throw new Error("AUTH_SECRET must be a strong random value with at least 32 characters");
  }

  return secret;
}

function base64UrlEncode(input: string) {
  const bytes = encoder.encode(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function bufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bufferToBase64Url(signature);
}

export function normalizeRole(role?: string | null): UserRole {
  return role === "admin" || role === "owner" ? "admin" : "user";
}

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createSessionToken(user: SessionUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    id: user.id,
    role: normalizeRole(user.role),
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(body);

  return `${body}.${signature}`;
}

export async function readSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = await sign(body);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;

    if (!payload.id || !payload.role || !payload.exp) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.id,
      name: "",
      email: "",
      role: normalizeRole(payload.role),
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
