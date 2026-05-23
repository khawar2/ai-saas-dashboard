"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type Conversation = {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  lastMessageAt: string | null;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  status: "pending" | "completed" | "failed";
  model?: string | null;
  totalTokens?: number;
  createdAt: string;
};

const prompts = ["Draft onboarding email", "Analyze usage risk", "Summarize support tickets", "Create pricing FAQ"];

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string; upgradeHref?: string };
    return {
      message: payload.error ?? "Something went wrong.",
      upgradeHref: payload.upgradeHref,
    };
  } catch {
    return { message: "Something went wrong.", upgradeHref: undefined };
  }
}

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeHref, setUpgradeHref] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  async function loadConversations(selectLatest = false) {
    setIsLoadingConversations(true);
    setError(null);
    setUpgradeHref(null);

    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });

      if (!response.ok) {
        const apiError = await readError(response);
        throw new Error(apiError.message);
      }

      const payload = (await response.json()) as { conversations: Conversation[] };
      setConversations(payload.conversations);

      if (selectLatest && payload.conversations[0]) {
        setSelectedConversationId(payload.conversations[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load conversations.");
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId: string) {
    setIsLoadingMessages(true);
    setError(null);
    setUpgradeHref(null);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });

      if (!response.ok) {
        const apiError = await readError(response);
        throw new Error(apiError.message);
      }

      const payload = (await response.json()) as { messages: ChatMessage[] };
      setMessages(payload.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load chat history.");
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    // Client-side data fetching keeps chat history fresh after sends and conversation switches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversations(true);
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, prompt?: string) {
    event?.preventDefault();
    const content = (prompt ?? input).trim();

    if (!content || isSending) {
      return;
    }

    const optimisticUserMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content,
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistantMessage: ChatMessage = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "Thinking...",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setInput("");
    setError(null);
    setUpgradeHref(null);
    setIsSending(true);
    setMessages((current) => [...current, optimisticUserMessage, optimisticAssistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationId: selectedConversationId ?? undefined,
        }),
      });

      if (!response.ok) {
        const apiError = await readError(response);
        setUpgradeHref(apiError.upgradeHref ?? null);
        throw new Error(apiError.message);
      }

      const payload = (await response.json()) as {
        conversationId: string;
        message: ChatMessage;
      };

      setSelectedConversationId(payload.conversationId);
      setMessages((current) =>
        current.map((message) => (message.id === optimisticAssistantMessage.id ? payload.message : message)),
      );
      await loadConversations();
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Unable to send message.";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
          item.id === optimisticAssistantMessage.id
            ? { ...item, content: message, status: "failed" }
            : item,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section data-testid="chat-page" className="grid min-h-[calc(100vh-8rem)] gap-6 xl:grid-cols-[1fr_22rem]">
      <Card data-testid="chat-panel" className="flex min-h-[38rem] flex-col p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-300">Assistant workspace</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {selectedConversation?.title ?? "New conversation"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedConversationId(null);
              setMessages([]);
              setError(null);
              setUpgradeHref(null);
            }}
            data-testid="new-conversation-button"
            className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-300/60 hover:bg-white/10"
          >
            New conversation
          </button>
        </div>

        {error ? (
          <Alert variant="error" className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              {upgradeHref ? (
                <a
                  href={upgradeHref}
                  className="rounded-full bg-red-100 px-4 py-2 text-center text-xs font-semibold text-red-950 transition hover:bg-white"
                >
                  Upgrade plan
                </a>
              ) : null}
            </div>
          </Alert>
        ) : null}

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-6">
          {isLoadingMessages ? (
            <div className="rounded-3xl bg-white/[0.04] p-5 text-sm text-slate-400">Loading chat history...</div>
          ) : null}

          {!isLoadingMessages && messages.length === 0 ? (
            <EmptyState
              title="Ask your AI assistant anything"
              description="Start a new conversation or continue a previous one from the history panel."
              className="h-full min-h-72"
            />
          ) : null}

          {messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "ml-auto max-w-2xl" : "mr-auto max-w-2xl"}>
              <div
                className={
                  message.role === "user"
                    ? "rounded-3xl bg-sky-400 p-4 text-slate-950"
                    : message.status === "failed"
                      ? "rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-red-100"
                      : "rounded-3xl bg-white/[0.06] p-4 text-slate-200"
                }
              >
                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                {message.status === "pending" ? (
                  <div className="mt-3 flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300 delay-150" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300 delay-300" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <form data-testid="chat-form" onSubmit={sendMessage} className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
          <textarea
            data-testid="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your AI assistant..."
            className="min-h-14 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/60"
            disabled={isSending}
            required
          />
          <Button data-testid="chat-send" type="submit" disabled={isSending || !input.trim()}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </form>
      </Card>

      <aside className="space-y-4">
        <Card data-testid="chat-history" className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Chat history</h3>
            {isLoadingConversations ? <span className="text-xs text-slate-500">Loading</span> : null}
          </div>
          <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto">
            {conversations.length === 0 && !isLoadingConversations ? (
              <p className="text-sm text-slate-400">No conversations yet.</p>
            ) : null}
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={
                  conversation.id === selectedConversationId
                    ? "rounded-2xl bg-sky-400 px-4 py-3 text-left text-sm font-semibold text-slate-950"
                    : "rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                }
              >
                <span className="block truncate">{conversation.title}</span>
                <span className="mt-1 block text-xs opacity-70">{conversation.messageCount} messages</span>
              </button>
            ))}
          </div>
        </Card>

        <Card data-testid="prompt-shortcuts" className="p-5">
          <h3 className="text-lg font-semibold text-white">Prompt shortcuts</h3>
          <div className="mt-4 grid gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(undefined, prompt)}
                disabled={isSending}
                className="rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white">Conversation health</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Provider: OpenAI</p>
            <p>Context: last 20 messages</p>
            <p>Status: {isSending ? "Generating response" : "Ready"}</p>
          </div>
        </Card>
      </aside>
    </section>
  );
}
