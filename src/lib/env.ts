export function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  aiProviderUrl: process.env.AI_PROVIDER_URL,
  aiProviderModel: process.env.AI_PROVIDER_MODEL ?? "production-model",
};
