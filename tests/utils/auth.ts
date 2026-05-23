import { expect, type Page } from "@playwright/test";

import type { TestUser } from "./test-users";

export async function signUp(page: Page, user: TestUser) {
  await page.goto("/signup");
  await page.getByTestId("signup-name").fill(user.name);
  await page.getByTestId("signup-email").fill(user.email);
  await page.getByTestId("signup-password").fill(user.password);
  await page.getByTestId("signup-submit").click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function login(page: Page, user: Pick<TestUser, "email" | "password">) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(user.email);
  await page.getByTestId("login-password").fill(user.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function logout(page: Page) {
  await page.getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login/);
}
