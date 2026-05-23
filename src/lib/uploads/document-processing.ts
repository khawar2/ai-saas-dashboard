import { createHash, randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { appConfig } from "@/lib/env";

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

const allowedTypes = new Map([
  ["application/pdf", ".pdf"],
  ["text/plain", ".txt"],
  ["text/markdown", ".md"],
]);

export function validateUpload(file: File) {
  if (!file.name) {
    return "File name is required.";
  }

  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "File is too large. Maximum upload size is 10MB.";
  }

  if (!allowedTypes.has(file.type)) {
    return "Unsupported file type. Upload a PDF, TXT, or Markdown file.";
  }

  return null;
}

function sanitizeBaseName(fileName: string) {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  return baseName.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdfText(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const parsed = await parser.getText();
  await parser.destroy();

  return {
    text: normalizeText(parsed.text),
    pageCount: parsed.total,
  };
}

export async function processUploadedDocument(file: File, userId: string) {
  const validationError = validateUpload(file);

  if (validationError) {
    throw new UploadValidationError(validationError);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" && !buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new UploadValidationError("Invalid PDF file.");
  }

  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const extension = allowedTypes.get(file.type) ?? path.extname(file.name).toLowerCase();
  const storedName = `${Date.now()}-${randomUUID()}-${sanitizeBaseName(file.name)}${extension}`;
  const uploadDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), appConfig.uploadStorageDir, userId);
  const storagePath = path.join(uploadDir, storedName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(storagePath, buffer, { flag: "wx" });

  if (file.type === "application/pdf") {
    const extracted = await extractPdfText(buffer);
    return {
      storedName,
      storagePath,
      sha256,
      extractedText: extracted.text,
      textPreview: extracted.text.slice(0, 500),
      pageCount: extracted.pageCount,
    };
  }

  const extractedText = normalizeText(buffer.toString("utf8"));

  return {
    storedName,
    storagePath,
    sha256,
    extractedText,
    textPreview: extractedText.slice(0, 500),
    pageCount: undefined,
  };
}
