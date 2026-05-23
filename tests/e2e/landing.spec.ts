import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads the SaaS landing page with core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("site-header")).toBeVisible();
    await expect(page.getByTestId("landing-hero")).toBeVisible();
    await expect(page.getByTestId("landing-features")).toBeVisible();
    await expect(page.getByTestId("landing-pricing")).toBeVisible();
    await expect(page.getByRole("heading", { name: /launch a premium ai saas/i })).toBeVisible();
  });

  test("has working login and signup links", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("signup-link").click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByTestId("signup-form")).toBeVisible();

    await page.goto("/");
    await page.getByTestId("login-link").click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("renders a usable mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("landing-hero")).toBeVisible();
    await expect(page.getByTestId("signup-link")).toBeVisible();
  });
});
