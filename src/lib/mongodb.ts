import { MongoClient } from "mongodb";

import { requiredEnv } from "@/lib/env";

type MongoGlobal = typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

export async function getMongoClient() {
  if (!globalForMongo.mongoClientPromise) {
    const uri = requiredEnv("MONGODB_URI");
    globalForMongo.mongoClientPromise = new MongoClient(uri).connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(requiredEnv("MONGODB_DB"));
}
