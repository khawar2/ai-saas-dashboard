import { ObjectId } from "mongodb";

import { getCollections } from "@/models/collections";
import type { UsageLimits, UserDocument } from "@/models/types";
import type { UserRole } from "@/lib/session";

export const DEFAULT_USER_LIMITS: UsageLimits = {
  monthlyMessages: 100,
  monthlyTokens: 50_000,
};

export async function findUserByEmail(email: string) {
  const { users } = await getCollections();

  return users.findOne({ email: email.toLowerCase() });
}

export async function findUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const { users } = await getCollections();

  return users.findOne({ _id: new ObjectId(userId) });
}

export async function countUsers() {
  const { users } = await getCollections();

  return users.countDocuments({});
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  const now = new Date();
  const user: Omit<UserDocument, "_id"> = {
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    status: "active",
    usageLimits: DEFAULT_USER_LIMITS,
    createdAt: now,
    updatedAt: now,
  };
  const { users } = await getCollections();
  const result = await users.insertOne(user as UserDocument);

  return { ...user, _id: result.insertedId };
}

export async function markUserLogin(userId: ObjectId) {
  const now = new Date();
  const { users } = await getCollections();

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        lastLoginAt: now,
        updatedAt: now,
      },
    },
  );
}
