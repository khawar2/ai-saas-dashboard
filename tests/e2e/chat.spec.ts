import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

test.describe("AI chat", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for chat tests.");
    await authenticateNewUser(page);
  });

  test("loads chat page and sends a message with a mocked AI response", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          conversationId: "mock-conversation-id",
          message: {
            id: "mock-message-id",
            role: "assistant",
            content: "This is a mocked AI response.",
            status: "completed",
            model: "gpt-4o-mini",
            createdAt: new Date().toISOString(),
          },
          usage: { inputTokens: 10, outputTokens: 12, totalTokens: 22 },
        }),
      });
    });

    await page.goto("/chat");
    await expect(page.getByTestId("chat-page")).toBeVisible();
    await page.getByTestId("chat-input").fill("Summarize my usage");
    await page.getByTestId("chat-send").click();

    await expect(page.getByText("Thinking...")).toBeVisible();
    await expect(page.getByText("This is a mocked AI response.")).toBeVisible();
  });

  test("shows a clear error when chat API fails", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "AI provider request failed. Please try again." }),
      });
    });

    await page.goto("/chat");
    await page.getByTestId("chat-input").fill("Fail gracefully");
    await page.getByTestId("chat-send").click();

    await expect(page.getByTestId("chat-panel").getByText(/ai provider request failed/i).last()).toBeVisible();
  });

  test("loads chat history and continues a previous conversation", async ({ page }) => {
    await page.route("**/api/conversations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          conversations: [
            {
              id: "conversation-1",
              title: "Previous conversation",
              status: "active",
              model: "gpt-4o-mini",
              messageCount: 2,
              lastMessageAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });
    await page.route("**/api/conversations/conversation-1/messages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          conversation: { id: "conversation-1", title: "Previous conversation" },
          messages: [
            {
              id: "message-1",
              role: "user",
              content: "Earlier question",
              status: "completed",
              createdAt: new Date().toISOString(),
            },
            {
              id: "message-2",
              role: "assistant",
              content: "Earlier answer",
              status: "completed",
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.goto("/chat");
    await expect(page.getByTestId("chat-history")).toContainText("Previous conversation");
    await page.getByTestId("chat-history").getByRole("button", { name: /previous conversation/i }).click();
    await expect(page.getByText("Earlier answer")).toBeVisible();
  });

  test("prompt shortcut buttons populate a request flow", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          conversationId: "shortcut-conversation-id",
          message: {
            id: "shortcut-message-id",
            role: "assistant",
            content: "Shortcut response",
            status: "completed",
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto("/chat");
    await page.getByTestId("prompt-shortcuts").getByRole("button", { name: /draft onboarding email/i }).click();

    await expect(page.getByText("Shortcut response")).toBeVisible();
  });
});
