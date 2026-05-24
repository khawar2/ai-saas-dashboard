import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for dashboard tests.");
    await authenticateNewUser(page);
  });

  test("shows usage cards, plan limits, and remaining credits", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("usage-cards")).toBeVisible();
    await expect(page.getByTestId("plan-limits")).toBeVisible();
    await expect(page.getByText("Remaining credits", { exact: true })).toBeVisible();
  });

  test("can display an upgrade message when usage limit is reached", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "You have reached your monthly message limit. Upgrade your plan to continue chatting.",
          code: "PLAN_LIMIT_REACHED",
          upgradeHref: "/billing",
        }),
      });
    });

    await page.goto("/chat");
    await page.getByTestId("chat-input").fill("Trigger limit");
    await page.getByTestId("chat-send").click();

    await expect(page.getByTestId("chat-panel").getByText(/upgrade your plan/i).last()).toBeVisible();
  });
});
