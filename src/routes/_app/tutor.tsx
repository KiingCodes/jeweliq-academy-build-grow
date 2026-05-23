import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askTutor } from "@/lib/tutor.functions";

export const Route = createFileRoute("/_app/tutor")({
  component: TutorPage,
  head: () => ({ meta: [{ title: "AI Tutor — JewelIQ Academy" }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Explain async/await like I'm five",
  "Why does my React useEffect run twice?",
  "Give me a beginner JavaScript exercise",
  "Review this code and suggest improvements",
];

function TutorPage() {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async (nextMessages: Msg[]) => ask({ data: { messages: nextMessages } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, mutation.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-2rem)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-gradient-brand flex h-10 w-10 items-center justify-center rounded-xl shadow-soft">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">AI Tutor</h1>
          <p className="text-xs text-muted-foreground">Your personal coding mentor — ask anything.</p>
        </div>
      </div>

      <div className="glass flex-1 overflow-y-auto rounded-2xl p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles className="mb-3 h-8 w-8 text-primary" />
            <p className="font-display text-lg font-semibold">How can I help you learn today?</p>
            <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started:</p>
            <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border bg-card p-3 text-left text-sm transition hover:border-primary hover:shadow-soft">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-muted" : "bg-gradient-brand"}`}>
                  {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-brand text-primary-foreground" : "bg-card border"}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex gap-3">
                <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-full"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                <div className="border bg-card rounded-2xl px-4 py-3 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask your tutor anything…"
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-xl"
        />
        <Button type="submit" disabled={mutation.isPending || !input.trim()} className="bg-gradient-brand h-11 text-primary-foreground border-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
