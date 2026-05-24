import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
const admin = {
  name: "README Admin",
  email: "admin@example.com",
  password: "ReadmeAdmin-12345",
};

async function ensureSignedIn(page) {
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.getByTestId("login-email").fill(admin.email);
  await page.getByTestId("login-password").fill(admin.password);
  await page.getByTestId("login-submit").click();

  try {
    await page.waitForURL(/\/dashboard/, { timeout: 4000 });
    return;
  } catch {
    // Account may not exist yet in the temporary local database.
  }

  await page.goto(`${baseURL}/signup`, { waitUntil: "networkidle" });
  await page.getByTestId("signup-name").fill(admin.name);
  await page.getByTestId("signup-email").fill(admin.email);
  await page.getByTestId("signup-password").fill(admin.password);
  await page.getByTestId("signup-submit").click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function screenshot(page, route, filename) {
  await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
}

fs.mkdirSync(screenshotsDir, { recursive: true });

const browser = await chromium.launch();

try {
  const publicPage = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await screenshot(publicPage, "/", "landing.png");
  await publicPage.close();

  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 1,
  });
  await screenshot(mobilePage, "/", "landing-mobile.png");
  await mobilePage.close();

  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await ensureSignedIn(page);
  await screenshot(page, "/dashboard", "dashboard.png");

  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        conversationId: "readme-preview-conversation",
        message: {
          id: "readme-preview-message",
          role: "assistant",
          content: "Here is a polished product summary, usage insight, and next best action for your SaaS workspace.",
          status: "completed",
          model: "gpt-4o-mini",
          createdAt: new Date().toISOString(),
        },
        usage: { inputTokens: 22, outputTokens: 38, totalTokens: 60 },
      }),
    });
  });
  await page.goto(`${baseURL}/chat`, { waitUntil: "networkidle" });
  await page.getByTestId("chat-input").fill("Summarize the workspace health");
  await page.getByTestId("chat-send").click();
  await page.getByText("polished product summary").waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotsDir, "chat.png"), fullPage: true });
  await page.unroute("**/api/chat");

  await screenshot(page, "/billing", "billing.png");
  await screenshot(page, "/documents", "documents.png");
  await screenshot(page, "/admin", "admin.png");

  console.log(`Screenshots saved to ${screenshotsDir}`);
} finally {
  await browser.close();
}
