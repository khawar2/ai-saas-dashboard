import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { processUploadedDocument } from "@/lib/uploads/document-processing";
import { createUploadedDocument, listUserDocuments } from "@/models/documents";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

function serializeDocument(document: Awaited<ReturnType<typeof createUploadedDocument>>) {
  return {
    id: String(document._id),
    originalName: document.originalName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    status: document.status,
    textPreview: document.textPreview,
    pageCount: document.pageCount ?? null,
    error: document.error ?? null,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const documents = await listUserDocuments(user._id);

  return NextResponse.json({
    documents: documents.map((document) => ({
      id: String(document._id),
      originalName: document.originalName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      status: document.status,
      textPreview: document.textPreview,
      pageCount: document.pageCount ?? null,
      error: document.error ?? null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A document file is required." }, { status: 400 });
  }

  try {
    const processed = await processUploadedDocument(file, String(user._id));
    const document = await createUploadedDocument({
      userId: user._id,
      originalName: file.name,
      storedName: processed.storedName,
      storagePath: processed.storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      sha256: processed.sha256,
      status: "ready",
      extractedText: processed.extractedText,
      textPreview: processed.textPreview,
      pageCount: processed.pageCount,
    });

    return NextResponse.json({ document: serializeDocument(document) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
