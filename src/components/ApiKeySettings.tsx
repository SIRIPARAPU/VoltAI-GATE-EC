"use client";

import { useEffect, useState } from "react";

// ── LOCKED: storage keys + types ──────────────────────────
const KEY = "gate_ai_api_key";
const MODEL = "gate_ai_model";
const PROVIDER = "gate_ai_provider";

type Provider = "openai" | "groq" | "gemini";

// ── LOCKED: business logic ─────────────────────────────────
function defaultModel(provider: Provider) {
  if (provider === "groq") return "llama-3.3-70b-versatile";
  if (provider === "gemini") return "gemini-1.5-flash";
  return "gpt-4o-mini";
}

export function ApiKeySettings() {
  // ── LOCKED: all state ────────────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(defaultModel("openai"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = (localStorage.getItem(PROVIDER) ?? "openai") as Provider;
    const p: Provider = raw === "groq" || raw === "gemini" ? raw : "openai";
    const apiKeyValue = localStorage.getItem(KEY) ?? "";
    const modelValue = localStorage.getItem(MODEL) ?? defaultModel(p);
    setTimeout(() => {
      setApiKey(apiKeyValue);
      setProvider(p);
      setModel(modelValue);
    }, 0);
  }, []);

  // ── LOCKED: save handler ─────────────────────────────────
  const save = () => {
    localStorage.setItem(KEY, apiKey.trim());
    localStorage.setItem(PROVIDER, provider);
    localStorage.setItem(MODEL, model.trim() || defaultModel(provider));
    setOpen(false);
  };
  // ─────────────────────────────────────────────────────────

  const providerLabels: Record<Provider, { label: string; color: string }> = {
    openai: { label: "OpenAI", color: "rgba(16, 185, 129, 0.8)" },
    groq: { label: "Groq", color: "rgba(245, 158, 11, 0.8)" },
    gemini: { label: "Google Gemini", color: "rgba(59, 130, 246, 0.8)" },
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderTopColor: "rgba(255,255,255,0.16)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        boxShadow:
          "0 4px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          {/* Provider badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "99px",
              marginBottom: "0.5rem",
              background: "rgba(109,40,217,0.12)",
              border: "1px solid rgba(109,40,217,0.3)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                display: "inline-block",
                background: providerLabels[provider].color,
                boxShadow: `0 0 6px ${providerLabels[provider].color}`,
              }}
            />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(196, 181, 253, 0.9)",
              }}
            >
              {providerLabels[provider].label}
            </span>
          </div>

          <div
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              color: "#f1f5f9",
              letterSpacing: "-0.01em",
            }}
          >
            AI Settings
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(148, 163, 184, 0.7)",
              marginTop: "0.2rem",
            }}
          >
            Your key is stored only in{" "}
            <span style={{ color: "rgba(196,181,253,0.8)", fontStyle: "italic" }}>
              your browser
            </span>{" "}
            (LocalStorage).
          </div>
        </div>

        {/* ── LOCKED: onClick ─ */}
        <button
          className={open ? "btn-secondary" : "btn-primary"}
          onClick={() => setOpen((v) => !v)}
          style={{ whiteSpace: "nowrap", minWidth: 72 }}
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {/* Divider */}
      {open && (
        <div
          aria-hidden
          className="divider-neon"
          style={{ margin: "1.25rem 0" }}
        />
      )}

      {/* Expanded settings form */}
      {open ? (
        <div style={{ display: "grid", gap: "1rem" }}>

          {/* Provider select */}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148, 163, 184, 0.7)",
              }}
            >
              Provider
            </span>
            {/* ── LOCKED: onChange ─ */}
            <select
              value={provider}
              onChange={(e) => {
                const v = e.target.value;
                const p: Provider =
                  v === "groq" || v === "gemini" ? v : "openai";
                setProvider(p);
                setModel((m) => (m?.trim() ? m : defaultModel(p)));
              }}
              className="input-neon"
              style={{ padding: "0.6rem 0.85rem", fontSize: "0.875rem" }}
            >
              <option value="openai">OpenAI</option>
              <option value="groq">Groq (free tier)</option>
              <option value="gemini">Google Gemini (free tier)</option>
            </select>
          </label>

          {/* API Key input */}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148, 163, 184, 0.7)",
              }}
            >
              API Key
            </span>
            {/* ── LOCKED: onChange ─ */}
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-neon font-mono"
              style={{ padding: "0.6rem 0.85rem", fontSize: "0.75rem" }}
              placeholder={
                provider === "groq"
                  ? "gsk_..."
                  : provider === "gemini"
                  ? "AIza..."
                  : "sk-..."
              }
            />
          </label>

          {/* Model input */}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148, 163, 184, 0.7)",
              }}
            >
              Model
            </span>
            {/* ── LOCKED: onChange ─ */}
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-neon font-mono"
              style={{ padding: "0.6rem 0.85rem", fontSize: "0.75rem" }}
              placeholder={defaultModel(provider)}
            />
          </label>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            {/* ── LOCKED: onClick ─ */}
            <button onClick={save} className="btn-primary" style={{ padding: "0.55rem 1.25rem" }}>
              Save
            </button>
            {/* ── LOCKED: onClick ─ */}
            <button
              onClick={() => setOpen(false)}
              className="btn-secondary"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── LOCKED: utility export ─────────────────────────────────
export function getStoredAiConfig() {
  if (typeof window === "undefined")
    return { apiKey: "", model: "gpt-4o-mini", provider: "openai" as Provider };
  const provider = (localStorage.getItem(PROVIDER) ?? "openai") as Provider;
  const p: Provider =
    provider === "groq" || provider === "gemini" ? provider : "openai";
  return {
    apiKey: localStorage.getItem(KEY) ?? "",
    model: localStorage.getItem(MODEL) ?? defaultModel(p),
    provider: p,
  };
}
