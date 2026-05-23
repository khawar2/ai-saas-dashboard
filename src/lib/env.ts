export function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  aiProvider: process.env.AI_PROVIDER ?? "openai",
  aiProviderUrl: process.env.AI_PROVIDER_URL,
  aiProviderModel: process.env.AI_PROVIDER_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  openAiApiKey: process.env.OPENAI_API_KEY,
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID,
  uploadStorageDir: process.env.UPLOAD_STORAGE_DIR ?? ".storage/uploads",
};
