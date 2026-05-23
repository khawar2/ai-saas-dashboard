import type { ObjectId } from "mongodb";

import { getCollections } from "@/models/collections";
import type { UploadedDocumentDocument } from "@/models/types";

export async function createUploadedDocument(input: Omit<UploadedDocumentDocument, "_id" | "createdAt" | "updatedAt">) {
  const now = new Date();
  const document: Omit<UploadedDocumentDocument, "_id"> = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  const { uploadedDocuments } = await getCollections();
  const result = await uploadedDocuments.insertOne(document as UploadedDocumentDocument);

  return { ...document, _id: result.insertedId };
}

export async function listUserDocuments(userId: ObjectId) {
  const { uploadedDocuments } = await getCollections();

  return uploadedDocuments
    .find(
      { userId },
      {
        projection: {
          extractedText: 0,
          storagePath: 0,
        },
      },
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
}
