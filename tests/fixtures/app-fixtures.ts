import { expect, test as base, type Page } from "@playwright/test";

import { login, signUp } from "../utils/auth";
import { getAdminUser, createTestUser, type TestUser } from "../utils/test-users";
import { skipWithoutAdminCredentials, skipWithoutDatabase } from "../utils/env";

export const test = base.extend<{
  testUser: TestUser;
}>({
  testUser: async ({}, fixtureUse) => {
    await fixtureUse(createTestUser());
  },
});

export { expect };

export async function authenticateNewUser(page: Page) {
  test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for authenticated E2E tests.");
  const user = createTestUser();
  await signUp(page, user);
  return user;
}

export async function authenticateAdmin(page: Page) {
  test.skip(skipWithoutAdminCredentials(), "PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD are required for admin E2E tests.");
  const admin = getAdminUser();
  await login(page, admin);
  return admin;
}
