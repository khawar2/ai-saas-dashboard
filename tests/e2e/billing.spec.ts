import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Billing", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for billing tests.");
    await authenticateNewUser(page);
  });

  test("loads billing page with Free and Pro plans plus status", async ({ page }) => {
    await page.goto("/billing");

    await expect(page.getByTestId("billing-page")).toBeVisible();
    await expect(page.getByTestId("billing-plans")).toContainText("Free");
    await expect(page.getByTestId("billing-plans")).toContainText("Pro");
    await expect(page.getByTestId("billing-status")).toBeVisible();
  });

  test("starts the Pro checkout flow without using real Stripe", async ({ page }) => {
    await page.route("**/api/billing/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Mock Stripe Checkout</body></html>",
      });
    });

    await page.goto("/billing");
    await page.getByTestId("upgrade-pro-button").click();
    await expect(page.getByText("Mock Stripe Checkout")).toBeVisible();
  });

  test("handles downgrade, cancellation, and resume endpoints securely", async ({ page }) => {
    const downgrade = await page.request.post("/api/billing/downgrade");
    expect([200, 303]).toContain(downgrade.status());

    const cancel = await page.request.post("/api/billing/cancel");
    expect([200, 303]).toContain(cancel.status());

    const resume = await page.request.post("/api/billing/resume");
    expect([200, 303]).toContain(resume.status());
  });
});
