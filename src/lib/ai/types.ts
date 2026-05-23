export type AiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiChatCompletionInput = {
  messages: AiChatMessage[];
  model?: string;
};

export type AiChatCompletionResult = {
  content: string;
  model: string;
  provider: string;
  providerMessageId?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AiProvider = {
  name: string;
  createChatCompletion(input: AiChatCompletionInput): Promise<AiChatCompletionResult>;
};
