import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

const mongo = await MongoMemoryServer.create({
  instance: {
    dbName: "ai_saas_dashboard_e2e",
  },
});

const args = process.argv.slice(2);
const playwrightArgs = args.length > 0 ? args : ["playwright", "test"];

const env = {
  ...process.env,
  MONGODB_URI: mongo.getUri(),
  MONGODB_DB: "ai_saas_dashboard_e2e",
  AUTH_SECRET: "e2e-auth-secret-with-at-least-32-characters",
  ADMIN_EMAILS: "playwright-admin@example.com",
  PLAYWRIGHT_ADMIN_EMAIL: "playwright-admin@example.com",
  PLAYWRIGHT_ADMIN_PASSWORD: "PlaywrightAdmin-12345",
  NEXT_PUBLIC_APP_URL: "http://localhost:3100",
  PLAYWRIGHT_BASE_URL: "http://localhost:3100",
  PLAYWRIGHT_SKIP_WEBSERVER: "",
  DISABLE_RATE_LIMITS: "true",
  OPENAI_API_KEY: "sk_test_not_used_in_e2e",
  STRIPE_SECRET_KEY: "sk_test_not_used_in_e2e",
  STRIPE_PRO_PRICE_ID: "price_test_not_used_in_e2e",
  STRIPE_WEBHOOK_SECRET: "whsec_test_not_used_in_e2e",
};

console.log(`Started in-memory MongoDB at ${mongo.getUri()}`);

const child = spawn("npx", playwrightArgs, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

let exitCode = 1;

child.on("exit", (code) => {
  exitCode = code ?? 1;
});

child.on("close", async () => {
  await mongo.stop();
  process.exit(exitCode);
});
