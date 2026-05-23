import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

const protectedRoutes = ["/dashboard", "/chat", "/documents", "/billing", "/settings", "/admin"];

test.describe("Protected routes", () => {
  for (const route of protectedRoutes) {
    test(`redirects unauthenticated users from ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId("login-form")).toBeVisible();
    });
  }

  test("allows authenticated users to access protected workspace pages", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for authenticated route tests.");

    await authenticateNewUser(page);

    for (const route of ["/dashboard", "/chat", "/documents", "/billing", "/settings"]) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route));
      await expect(page.getByTestId("app-topbar")).toBeVisible();
    }
  });
});
