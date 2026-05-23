export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function createTestUser(prefix = "user"): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `Playwright ${prefix}`,
    email: `playwright-${prefix}-${id}@example.com`,
    password: `Pw-${id}-secure123`,
  };
}

export function getAdminUser(): TestUser {
  return {
    name: "Playwright Admin",
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "",
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "",
  };
}
