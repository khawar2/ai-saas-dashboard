import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

const mongo = await MongoMemoryServer.create({
  instance: {
    dbName: "ai_saas_dashboard_local",
  },
});

const env = {
  ...process.env,
  MONGODB_URI: mongo.getUri(),
  MONGODB_DB: "ai_saas_dashboard_local",
  AUTH_SECRET: "local-memory-auth-secret-with-at-least-32-characters",
  ADMIN_EMAILS: "admin@example.com",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "sk_local_not_configured",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "sk_test_local_not_configured",
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID ?? "price_local_not_configured",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_local_not_configured",
};

console.log(`Started in-memory MongoDB at ${mongo.getUri()}`);
console.log("Next.js will run at http://localhost:3000");
console.log("Data is temporary and will reset when this process stops.");

const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

async function shutdown() {
  child.kill();
  await mongo.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", async (code) => {
  await mongo.stop();
  process.exit(code ?? 0);
});
