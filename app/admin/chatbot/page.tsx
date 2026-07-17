"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import type { ChatbotSettings, KnowledgeBase } from "@/lib/chatbot-store";

type SessionState = { authenticated: boolean; configured: boolean; csrfToken: string };
type Analytics = { totalConversationsToday: number; mostAskedQuestions: string[]; averageResponseTimeMs: number };

// Admin page for chatbot appearance, knowledge base, retraining, testing, and analytics.
export default function ChatbotAdminPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeBase | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testAnswer, setTestAnswer] = useState("");
  const [debugContext, setDebugContext] = useState("");
  const mutationHeaders = (withJson = false) => ({
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    "x-admin-csrf": session?.csrfToken || ""
  });

  useEffect(() => {
    async function load() {
      const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
      const nextSession = (await sessionResponse.json()) as SessionState;
      setSession(nextSession);

      if (!nextSession.authenticated) {
        return;
      }

      const [settingsResponse, knowledgeResponse, analyticsResponse] = await Promise.all([
        fetch("/api/chat/settings", { cache: "no-store" }),
        fetch("/api/chat/knowledge", { cache: "no-store" }),
        fetch("/api/chat/analytics", { cache: "no-store" })
      ]);
      setSettings((await settingsResponse.json()) as ChatbotSettings);
      setKnowledge((await knowledgeResponse.json()) as KnowledgeBase);
      setAnalytics((await analyticsResponse.json()) as Analytics);
    }

    load();
  }, []);

  // Saves chatbot appearance settings to /data/chatbot-settings.json.
  async function saveSettings() {
    if (!settings) return;
    setBusy("settings");
    const response = await fetch("/api/chat/settings", { method: "PUT", headers: mutationHeaders(true), body: JSON.stringify(settings) });
    setStatus(response.ok ? "Chatbot settings saved." : "Unable to save settings.");
    setBusy("");
  }

  // Saves edited knowledge base data to /data/knowledge-base.json.
  async function saveKnowledge() {
    if (!knowledge) return;
    setBusy("knowledge");
    const response = await fetch("/api/chat/knowledge", { method: "PUT", headers: mutationHeaders(true), body: JSON.stringify(knowledge) });
    setStatus(response.ok ? "Knowledge base saved. Retrain AI to update embeddings." : "Unable to save knowledge base.");
    setBusy("");
  }

  // Calls the Python retrain endpoint through the Next.js proxy.
  async function retrain() {
    setBusy("retrain");
    const response = await fetch("/api/chat/retrain", { method: "POST", headers: mutationHeaders() });
    const result = (await response.json()) as { message?: string; lastTrainedAt?: string };
    if (response.ok) {
      setSettings(settings ? { ...settings, lastTrainedAt: result.lastTrainedAt || new Date().toISOString() } : settings);
      setStatus("AI retrained successfully.");
    } else {
      setStatus(result.message || "Retraining failed.");
    }
    setBusy("");
  }

  // Runs a live admin test and retrieves debug context for the same question.
  async function runLiveTest() {
    if (!testMessage.trim()) return;
    setBusy("test");
    setTestAnswer("");
    const [chatResponse, debugResponse] = await Promise.all([
      fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: testMessage, history: [] }) }),
      fetch("/api/chat/debug", { method: "POST", headers: mutationHeaders(true), body: JSON.stringify({ message: testMessage, history: [] }) })
    ]);

    if (debugResponse.ok) {
      const debug = (await debugResponse.json()) as { context?: string };
      setDebugContext(debug.context || "");
    }

    if (chatResponse.body) {
      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        setTestAnswer((current) => current + decoder.decode(result.value || new Uint8Array(), { stream: !done }));
      }
    } else {
      setTestAnswer("Chatbot server is offline.");
    }
    setBusy("");
  }

  if (!session) {
    return <AdminShell><Loader2 className="animate-spin text-[#16f2a4]" size={34} /></AdminShell>;
  }

  if (!session.authenticated) {
    return (
      <AdminShell>
        <div className="max-w-xl rounded-[8px] border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-3xl font-black">Chatbot Admin</h1>
          <p className="mt-3 text-white/60">Please log in through the main admin panel first.</p>
          <a href="/admin1122" className="mt-5 inline-flex rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">Go to Login</a>
        </div>
      </AdminShell>
    );
  }

  if (!settings || !knowledge) {
    return <AdminShell><Loader2 className="animate-spin text-[#16f2a4]" size={34} /></AdminShell>;
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-[#16f2a4]">AI Chatbot</p>
          <h1 className="text-3xl font-black">Portfolio Chatbot Manager</h1>
        </div>
        <button type="button" onClick={retrain} className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">
          {busy === "retrain" ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
          Retrain AI
        </button>
      </div>

      {status ? <p className="mb-5 rounded-[8px] border border-[#16f2a4]/30 bg-[#16f2a4]/10 p-3 text-sm font-bold text-[#bfffe8]">{status}</p> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Frontend Appearance Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Bubble position" value={settings.position} options={["bottom-right", "bottom-left"]} onChange={(value) => setSettings({ ...settings, position: value as ChatbotSettings["position"] })} />
            <ColorField label="Bubble color" value={settings.bubbleColor} onChange={(value) => setSettings({ ...settings, bubbleColor: value })} />
            <TextField label="Window title" value={settings.windowTitle} onChange={(value) => setSettings({ ...settings, windowTitle: value })} />
            <TextField label="Bot name" value={settings.botName} onChange={(value) => setSettings({ ...settings, botName: value })} />
            <TextField label="Bot avatar image" value={settings.botAvatar} onChange={(value) => setSettings({ ...settings, botAvatar: value })} />
            <ColorField label="Primary chat color" value={settings.primaryColor} onChange={(value) => setSettings({ ...settings, primaryColor: value })} />
          </div>
          <TextArea label="Welcome message" value={settings.welcomeMessage} onChange={(value) => setSettings({ ...settings, welcomeMessage: value })} />
          <TextField label="Input placeholder" value={settings.placeholder} onChange={(value) => setSettings({ ...settings, placeholder: value })} />
          <TextArea label="Hidden pages" value={settings.hiddenPages.join("\n")} onChange={(value) => setSettings({ ...settings, hiddenPages: lines(value) })} />
          <Toggle label="Enable chatbot globally" checked={settings.enabled} onChange={(value) => setSettings({ ...settings, enabled: value })} />
          <Toggle label="Show suggestion chips" checked={settings.showSuggestions} onChange={(value) => setSettings({ ...settings, showSuggestions: value })} />
          <EditableList label="Custom suggestion questions" items={settings.suggestions} onChange={(items) => setSettings({ ...settings, suggestions: items })} />
          <ActionButton busy={busy === "settings"} onClick={saveSettings} label="Save Settings" />
        </Panel>

        <Panel title="Analytics">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Conversations today" value={String(analytics?.totalConversationsToday || 0)} />
            <Stat label="Average response" value={`${analytics?.averageResponseTimeMs || 0}ms`} />
            <Stat label="Last trained" value={settings.lastTrainedAt || "Never"} />
          </div>
          <div>
            <p className="mb-2 font-black">Most asked questions</p>
            <div className="grid gap-2">
              {(analytics?.mostAskedQuestions || []).map((question) => <p key={question} className="rounded-[8px] border border-white/10 bg-black/25 p-3 text-sm text-white/70">{question}</p>)}
            </div>
          </div>
        </Panel>

        <Panel title="Knowledge Base Manager">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.keys(knowledge.owner).map((key) => (
              <TextField key={key} label={`Owner ${key}`} value={String(knowledge.owner[key] || "")} onChange={(value) => setKnowledge({ ...knowledge, owner: { ...knowledge.owner, [key]: value } })} />
            ))}
          </div>
          <EditableQA title="FAQ" items={knowledge.faq} onChange={(items) => setKnowledge({ ...knowledge, faq: items })} />
          <EditableQA title="Custom Q&A" items={knowledge.customQA} onChange={(items) => setKnowledge({ ...knowledge, customQA: items })} />
          <ActionButton busy={busy === "knowledge"} onClick={saveKnowledge} label="Save Knowledge Base" />
        </Panel>

        <Panel title="Live Test">
          <TextArea label="Test question" value={testMessage} onChange={setTestMessage} />
          <button type="button" onClick={runLiveTest} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">
            {busy === "test" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Ask AI
          </button>
          <div className="rounded-[8px] border border-white/10 bg-black/25 p-4">
            <p className="mb-2 font-black">Response</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-white/70">{testAnswer || "Test responses appear here."}</p>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-black/25 p-4">
            <p className="mb-2 font-black">Retrieved Context</p>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/55">{debugContext || "Context appears here when the Python server is running."}</pre>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#070b12] p-5 text-white sm:p-8">{children}</main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5"><h2 className="mb-4 text-xl font-black">{title}</h2><div className="grid gap-4">{children}</div></section>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-bold text-white/70">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#16f2a4]" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-bold text-white/70">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#16f2a4]" /></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-bold text-white/70">{label}<span className="flex overflow-hidden rounded-[8px] border border-white/10 bg-black/35"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-14 bg-transparent p-1" /><input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-white outline-none" /></span></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-bold text-white/70">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/25 p-3 font-bold text-white/70"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#16f2a4]" />{label}</label>;
}

function EditableList({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return <div className="grid gap-2"><p className="font-black">{label}</p>{items.map((item, index) => <div key={index} className="flex gap-2"><input value={item} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? event.target.value : current))} className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none" /><button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="grid h-12 w-12 place-items-center rounded-full border border-red-300/30 text-red-100"><Trash2 size={16} /></button></div>)}<button type="button" onClick={() => onChange([...items, "New question"])} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-bold text-white/70"><Plus size={16} />Add</button></div>;
}

function EditableQA({ title, items, onChange }: { title: string; items: Array<{ question: string; answer: string }>; onChange: (items: Array<{ question: string; answer: string }>) => void }) {
  return <div className="grid gap-3"><p className="font-black">{title}</p>{items.map((item, index) => <div key={index} className="grid gap-3 rounded-[8px] border border-white/10 bg-black/25 p-3"><TextField label="Question" value={item.question} onChange={(value) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, question: value } : current))} /><TextArea label="Answer" value={item.answer} onChange={(value) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, answer: value } : current))} /><button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex w-fit items-center gap-2 rounded-full border border-red-300/30 px-4 py-2 font-bold text-red-100"><Trash2 size={16} />Delete</button></div>)}<button type="button" onClick={() => onChange([...items, { question: "New question", answer: "New answer" }])} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-bold text-white/70"><Plus size={16} />Add {title}</button></div>;
}

function ActionButton({ busy, onClick, label }: { busy: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">{busy ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}{label}</button>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] border border-white/10 bg-black/25 p-4"><p className="text-xs font-bold uppercase text-white/42">{label}</p><p className="mt-2 break-words text-xl font-black">{value}</p></div>;
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
