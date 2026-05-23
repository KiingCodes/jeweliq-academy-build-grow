import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MessageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) });
const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are the JewelIQ Academy AI Tutor — a friendly, patient coding mentor.
- Explain concepts simply, with short code examples.
- When fixing bugs, walk through the reasoning before showing the fix.
- Encourage learners and suggest next exercises.
- Use Markdown with fenced code blocks for code.
- Keep replies concise and focused.`;

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured.");

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      await context.supabase.from("ai_chats").insert({ user_id: context.userId, role: "user", content: lastUser.content });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
    if (!res.ok) throw new Error(`AI error (${res.status})`);

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = json.choices?.[0]?.message?.content ?? "Sorry — I couldn't generate a response.";

    await context.supabase.from("ai_chats").insert({ user_id: context.userId, role: "assistant", content: reply });

    return { reply };
  });
