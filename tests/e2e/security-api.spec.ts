import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { logout } from "../utils/auth";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Security and API behavior", () => {
  test("returns 401 for protected API routes without authentication", async ({ request }) => {
    const conversations = await request.get("/api/conversations");
    expect(conversations.status()).toBe(401);

    const usage = await request.get("/api/usage");
    expect(usage.status()).toBe(401);

    const documents = await request.get("/api/documents");
    expect(documents.status()).toBe(401);

    const chat = await request.post("/api/chat", { data: { message: "Hello" } });
    expect(chat.status()).toBe(401);

    const checkout = await request.post("/api/billing/checkout", {
      multipart: { plan: "pro" },
    });
    expect(checkout.status()).toBe(401);
  });

  test("rejects invalid credentials", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for credential validation tests.");

    await page.goto("/login");
    await page.getByTestId("login-email").fill("invalid@example.com");
    await page.getByTestId("login-password").fill("not-the-password");
    await page.getByTestId("login-submit").click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test("returns 403 for admin API route for non-admin users", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for role enforcement tests.");

    await authenticateNewUser(page);
    const response = await page.request.get("/api/admin/users");
    expect(response.status()).toBe(403);
  });

  test("validates upload file type and size", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for upload validation tests.");

    await authenticateNewUser(page);

    const invalidType = await page.request.post("/api/documents", {
      multipart: {
        file: {
          name: "not-allowed.exe",
          mimeType: "application/octet-stream",
          buffer: Buffer.from("not allowed"),
        },
      },
    });
    expect(invalidType.status()).toBe(400);
    await expect(invalidType.json()).resolves.toMatchObject({
      error: expect.stringMatching(/unsupported file type/i),
    });

    const oversized = await page.request.post("/api/documents", {
      multipart: {
        file: {
          name: "large.txt",
          mimeType: "text/plain",
          buffer: Buffer.alloc(11 * 1024 * 1024, "a"),
        },
      },
    });
    expect(oversized.status()).toBe(400);
    await expect(oversized.json()).resolves.toMatchObject({
      error: expect.stringMatching(/file is too large/i),
    });
  });

  test("logout clears access to protected pages", async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for logout security tests.");

    await authenticateNewUser(page);
    await logout(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
