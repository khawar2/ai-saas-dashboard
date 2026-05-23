import path from "path";

import { expect, test, authenticateNewUser } from "../fixtures/app-fixtures";
import { skipWithoutDatabase } from "../utils/env";

test.describe("Documents and file uploads", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipWithoutDatabase(), "MongoDB/Auth env vars are required for document upload tests.");
    await authenticateNewUser(page);
  });

  test("loads documents page with empty or existing document state", async ({ page }) => {
    await page.goto("/documents");

    await expect(page.getByTestId("documents-page")).toBeVisible();
    await expect(page.getByTestId("document-upload-form")).toBeVisible();
    await expect(page.getByTestId("documents-list")).toBeVisible();
  });

  test("uploads a valid TXT file and shows it in the list", async ({ page }) => {
    await page.goto("/documents");

    await page.getByTestId("document-file-input").setInputFiles(path.join(process.cwd(), "tests/fixtures/files/sample.txt"));
    await page.getByTestId("document-upload-submit").click();

    await expect(page.getByText("sample.txt")).toBeVisible();
    await expect(page.getByText(/playwright upload fixture/i)).toBeVisible();
  });

  test("uploads a valid PDF file with mocked storage response", async ({ page }) => {
    await page.route("**/api/documents", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          document: {
            id: "mock-pdf-id",
            originalName: "sample.pdf",
            mimeType: "application/pdf",
            sizeBytes: 512,
            status: "ready",
            textPreview: "Mock extracted PDF text",
            pageCount: 1,
            error: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto("/documents");
    await page.getByTestId("document-file-input").setInputFiles({
      name: "sample.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n% Playwright mocked pdf\n"),
    });
    await page.getByTestId("document-upload-submit").click();

    await expect(page.getByText("sample.pdf")).toBeVisible();
    await expect(page.getByText("Mock extracted PDF text")).toBeVisible();
  });

  test("shows validation error for invalid file type", async ({ page }) => {
    await page.goto("/documents");
    await page.getByTestId("document-file-input").setInputFiles({
      name: "malware.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not allowed"),
    });
    await page.getByTestId("document-upload-submit").click();

    await expect(page.getByText(/unsupported file type/i)).toBeVisible();
  });

  test("shows validation error for oversized files", async ({ page }) => {
    await page.goto("/documents");
    await page.getByTestId("document-file-input").setInputFiles({
      name: "large.txt",
      mimeType: "text/plain",
      buffer: Buffer.alloc(11 * 1024 * 1024, "a"),
    });
    await page.getByTestId("document-upload-submit").click();

    await expect(page.getByText(/file is too large/i)).toBeVisible();
  });
});
