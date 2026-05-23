import { expect, test, authenticateAdmin, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutAdminCredentials, skipWithoutDatabase } from "../utils/env";

test.describe("Admin", () => {
  test("redirects non-admin users away from /admin", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for admin route tests.");

    await authenticateNewUser(page);
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("allows admins to view platform monitoring tables", async ({ page }) => {
    test.skip(skipWithoutAdminCredentials(), "Admin credentials are required for admin panel tests.");

    await authenticateAdmin(page);
    await page.goto("/admin");

    await expect(page.getByTestId("admin-page")).toBeVisible();
    await expect(page.getByTestId("admin-summary-cards")).toBeVisible();
    await expect(page.getByTestId("admin-users-table")).toBeVisible();
    await expect(page.getByTestId("admin-subscriptions-table")).toBeVisible();
    await expect(page.getByTestId("admin-conversations-table")).toBeVisible();
    await expect(page.getByTestId("admin-activity-table")).toBeVisible();
  });
});
