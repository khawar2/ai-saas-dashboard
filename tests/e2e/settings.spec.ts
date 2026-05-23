import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Settings", () => {
  test("loads settings form and allows editing fields", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for settings tests.");

    await authenticateNewUser(page);
    await page.goto("/settings");

    await expect(page.getByTestId("settings-page")).toBeVisible();
    await expect(page.getByTestId("settings-form")).toBeVisible();
    await page.getByTestId("settings-workspace-name").fill("Playwright Workspace");
    await page.getByTestId("settings-support-email").fill("qa@example.com");
    await expect(page.getByTestId("settings-save")).toBeEnabled();
  });
});
