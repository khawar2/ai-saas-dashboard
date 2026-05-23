import OpenAI from "openai";

import { appConfig, requiredEnv } from "@/lib/env";
import type { AiProvider } from "@/lib/ai/types";

export function createOpenAiProvider(): AiProvider {
  const client = new OpenAI({
    apiKey: appConfig.openAiApiKey ?? requiredEnv("OPENAI_API_KEY"),
  });

  return {
    name: "openai",
    async createChatCompletion(input) {
      const model = input.model ?? appConfig.aiProviderModel;
      const completion = await client.chat.completions.create({
        model,
        messages: input.messages,
        temperature: 0.7,
      });
      const [choice] = completion.choices;
      const content = choice?.message?.content?.trim();

      if (!content) {
        throw new Error("OpenAI returned an empty response.");
      }

      return {
        content,
        model: completion.model,
        provider: "openai",
        providerMessageId: completion.id,
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      };
    },
  };
}
