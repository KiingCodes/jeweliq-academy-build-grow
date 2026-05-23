import { createFileRoute } from "@tanstack/react-router";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Play, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/playground")({
  component: Playground,
  head: () => ({ meta: [{ title: "Playground — JewelIQ Academy" }] }),
});

const starters: Record<string, string> = {
  javascript: `// Welcome to the JewelIQ playground!
// Click Run to execute. console.log writes to the output below.

function greet(name) {
  return \`Hello, \${name}! Ready to build?\`;
}

console.log(greet("learner"));
[1, 2, 3].map((n) => console.log("n =", n * n));`,
  typescript: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet("learner"));`,
  html: `<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px;">
    <h1 style="color: #7c3aed;">Hello from JewelIQ</h1>
    <p>Edit the HTML on the left and click Run.</p>
  </body>
</html>`,
  python: `# Python runs server-side in production.
# For now, this is a syntax-only sandbox.
print("Hello from Python!")`,
};

function Playground() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starters.javascript);
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const onLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(starters[lang] ?? "");
    setOutput([]);
    setPreviewHtml(null);
  };

  const run = async () => {
    setRunning(true);
    setOutput([]);
    setPreviewHtml(null);
    try {
      if (language === "html") {
        setPreviewHtml(code);
      } else if (language === "javascript" || language === "typescript") {
        const logs: string[] = [];
        const console = {
          log: (...args: unknown[]) => logs.push(args.map(formatArg).join(" ")),
          error: (...args: unknown[]) => logs.push("⚠ " + args.map(formatArg).join(" ")),
          warn: (...args: unknown[]) => logs.push("⚠ " + args.map(formatArg).join(" ")),
        };
        const stripped = language === "typescript" ? code.replace(/:\s*[A-Za-z<>\[\]|&,\s]+(?=[=,)])/g, "") : code;
        // eslint-disable-next-line no-new-func
        const fn = new Function("console", stripped);
        const result = fn(console);
        if (result !== undefined) logs.push("→ " + formatArg(result));
        setOutput(logs);
      } else {
        setOutput(["Python execution coming soon — for now, edit and read your code."]);
      }
    } catch (err) {
      setOutput([`❌ ${(err as Error).message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-2rem)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Playground</h1>
          <p className="text-xs text-muted-foreground">Write code, run it, learn faster.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="html">HTML / CSS</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={run} disabled={running} className="bg-gradient-brand text-primary-foreground border-0">
            {running ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />} Run
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-3 overflow-hidden lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Editor
            height="100%"
            language={language === "html" ? "html" : language}
            value={code}
            theme="vs-dark"
            onChange={(v) => setCode(v ?? "")}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 14 }, scrollBeyondLastLine: false }}
          />
        </div>
        <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{previewHtml ? "Preview" : "Console"}</span>
            <button onClick={() => { setOutput([]); setPreviewHtml(null); }} className="text-muted-foreground hover:text-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {previewHtml ? (
            <iframe title="preview" srcDoc={previewHtml} className="flex-1 bg-white" sandbox="" />
          ) : (
            <pre className="flex-1 overflow-auto bg-[oklch(0.18_0.03_270)] p-4 font-mono text-xs text-[oklch(0.95_0.02_280)]">
              {output.length === 0 ? <span className="text-muted-foreground">Output appears here. Click Run.</span> : output.join("\n")}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function formatArg(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}
