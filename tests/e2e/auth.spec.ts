import { expect, test } from "../fixtures/app-fixtures";
import { login, logout, signUp } from "../utils/auth";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Authentication", () => {
  test("loads login and signup pages", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();

    await page.goto("/signup");
    await expect(page.getByTestId("signup-form")).toBeVisible();
  });

  test("signs up, redirects authenticated users away from auth pages, and logs out", async ({ page, testUser }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for signup tests.");

    await signUp(page, testUser);
    await expect(page.getByTestId("app-topbar")).toBeVisible();

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);

    await logout(page);
  });

  test("logs in with valid credentials", async ({ page, testUser }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for login tests.");

    await signUp(page, testUser);
    await logout(page);
    await login(page, testUser);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for invalid credential tests.");

    await page.goto("/login");
    await page.getByTestId("login-email").fill("missing-user@example.com");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit").click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});
