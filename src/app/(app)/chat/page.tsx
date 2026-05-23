import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const messages = [
  { role: "assistant", content: "Connect AI_PROVIDER_API_KEY and AI_PROVIDER_URL to enable secure model calls." },
  { role: "user", content: "Summarize this workspace usage and identify risk." },
  { role: "assistant", content: "Usage is growing steadily. Add spend alerts before opening the product to larger teams." },
];

export default function ChatPage() {
  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-sky-300">AI Chat</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Assistant workspace</h1>
        <p className="mt-3 max-w-2xl text-slate-400">A provider-agnostic chat surface backed by a secure API route.</p>
      </div>
      <Card className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-4 overflow-hidden">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-2xl" : "mr-auto max-w-2xl"}>
              <div className={message.role === "user" ? "rounded-3xl bg-sky-400 p-4 text-slate-950" : "rounded-3xl bg-white/[0.06] p-4 text-slate-200"}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form action="/api/chat" method="post" className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
          <textarea
            name="message"
            placeholder="Ask your AI assistant..."
            className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/60"
            required
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </section>
  );
}
