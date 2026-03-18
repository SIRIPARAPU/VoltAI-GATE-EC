"use client";

import { useEffect, useState } from "react";

const KEY = "gate_ai_api_key";
const MODEL = "gate_ai_model";
const PROVIDER = "gate_ai_provider";

type Provider = "openai" | "groq" | "gemini";

function defaultModel(provider: Provider) {
  // Better quality for reasoning-heavy GATE questions.
  if (provider === "groq") return "llama-3.3-70b-versatile";
  if (provider === "gemini") return "gemini-1.5-flash";
  return "gpt-4o-mini";
}

export function ApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(defaultModel("openai"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = (localStorage.getItem(PROVIDER) ?? "openai") as Provider;
    const p: Provider = raw === "groq" || raw === "gemini" ? raw : "openai";
    const apiKeyValue = localStorage.getItem(KEY) ?? "";
    const modelValue = localStorage.getItem(MODEL) ?? defaultModel(p);

    // Avoid React linter warning about synchronous setState in effects.
    setTimeout(() => {
      setApiKey(apiKeyValue);
      setProvider(p);
      setModel(modelValue);
    }, 0);
  }, []);

  const save = () => {
    localStorage.setItem(KEY, apiKey.trim());
    localStorage.setItem(PROVIDER, provider);
    localStorage.setItem(MODEL, model.trim() || defaultModel(provider));
    setOpen(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-zinc-100">AI Settings</div>
          <div className="text-xs text-zinc-300">
            Your key is stored only in your browser (LocalStorage).
          </div>
        </div>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-200">Provider</span>
            <select
              value={provider}
              onChange={(e) => {
                const v = e.target.value;
                const p: Provider = v === "groq" || v === "gemini" ? v : "openai";
                setProvider(p);
                setModel((m) => (m?.trim() ? m : defaultModel(p)));
              }}
              className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="openai">OpenAI</option>
              <option value="groq">Groq (free tier)</option>
              <option value="gemini">Google Gemini (free tier)</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-200">API Key</span>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 font-mono text-xs text-zinc-100"
              placeholder={
                provider === "groq" ? "gsk_..." : provider === "gemini" ? "AIza..." : "sk-..."
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-200">Model</span>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 font-mono text-xs text-zinc-100"
              placeholder={defaultModel(provider)}
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="rounded-xl bg-[#6D28D9] px-3 py-2 text-sm text-white hover:bg-[#5B21B6]"
            >
              Save
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function getStoredAiConfig() {
  if (typeof window === "undefined")
    return { apiKey: "", model: "gpt-4o-mini", provider: "openai" as Provider };
  const provider = (localStorage.getItem(PROVIDER) ?? "openai") as Provider;
  const p: Provider = provider === "groq" || provider === "gemini" ? provider : "openai";
  return {
    apiKey: localStorage.getItem(KEY) ?? "",
    model: localStorage.getItem(MODEL) ?? defaultModel(p),
    provider: p,
  };
}

