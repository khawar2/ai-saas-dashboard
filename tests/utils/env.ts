export const hasDatabaseEnv = Boolean(
  process.env.MONGODB_URI &&
    process.env.MONGODB_DB &&
    process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET.length >= 32 &&
    !process.env.AUTH_SECRET.includes("generate-a-random"),
);

export const hasAdminCredentials = Boolean(
  process.env.PLAYWRIGHT_ADMIN_EMAIL && process.env.PLAYWRIGHT_ADMIN_PASSWORD,
);

export function skipWithoutDatabase() {
  return !hasDatabaseEnv;
}

export function skipWithoutAdminCredentials() {
  return !hasDatabaseEnv || !hasAdminCredentials;
}
