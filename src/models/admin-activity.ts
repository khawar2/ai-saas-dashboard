import type { ObjectId } from "mongodb";

import { getCollections } from "@/models/collections";
import type { AdminActivityDocument } from "@/models/types";

export async function logAdminActivity(input: {
  actorUserId?: ObjectId;
  actorEmail?: string;
  action: string;
  targetType: AdminActivityDocument["targetType"];
  targetId?: ObjectId;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date();
  const activity: Omit<AdminActivityDocument, "_id"> = {
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };
  const { adminActivity } = await getCollections();
  const result = await adminActivity.insertOne(activity as AdminActivityDocument);

  return { ...activity, _id: result.insertedId };
}
