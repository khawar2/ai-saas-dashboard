import { appConfig } from "@/lib/env";
import { createOpenAiProvider } from "@/lib/ai/openai-provider";
import type { AiProvider } from "@/lib/ai/types";

export function getAiProvider(): AiProvider {
  switch (appConfig.aiProvider) {
    case "openai":
      return createOpenAiProvider();
    default:
      throw new Error(`Unsupported AI provider: ${appConfig.aiProvider}`);
  }
}
