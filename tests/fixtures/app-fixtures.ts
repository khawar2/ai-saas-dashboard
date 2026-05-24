import { expect, test as base, type Page } from "@playwright/test";

import { signUp } from "../utils/auth";
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
  if (process.env.PLAYWRIGHT_ADMIN_EMAIL && process.env.PLAYWRIGHT_ADMIN_PASSWORD) {
    await ensureAdminUserExists(page);
    await page.context().clearCookies();
  }

  const user = createTestUser();
  await signUp(page, user);
  return user;
}

async function ensureAdminUserExists(page: Page) {
  const admin = getAdminUser();

  const loginResponse = await page.request.post("/api/auth/login", {
    data: {
      email: admin.email,
      password: admin.password,
      next: "/dashboard",
    },
    headers: {
      Accept: "application/json",
    },
  });

  if (!loginResponse.ok()) {
    const registerResponse = await page.request.post("/api/auth/register", {
      data: {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        next: "/dashboard",
      },
      headers: {
        Accept: "application/json",
      },
    });

    if (!registerResponse.ok() && registerResponse.status() !== 409) {
      throw new Error(`Unable to create admin test user: ${registerResponse.status()} ${await registerResponse.text()}`);
    }

    if (registerResponse.status() === 409) {
      const retryLoginResponse = await page.request.post("/api/auth/login", {
        data: {
          email: admin.email,
          password: admin.password,
          next: "/dashboard",
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (!retryLoginResponse.ok()) {
        throw new Error(`Unable to login admin test user: ${retryLoginResponse.status()} ${await retryLoginResponse.text()}`);
      }
    }
  }

  return admin;
}

export async function authenticateAdmin(page: Page) {
  test.skip(skipWithoutAdminCredentials(), "PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD are required for admin E2E tests.");
  const admin = await ensureAdminUserExists(page);

  await page.goto("/dashboard");
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  return admin;
}
