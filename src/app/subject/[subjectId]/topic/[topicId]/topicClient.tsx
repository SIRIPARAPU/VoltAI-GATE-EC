"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getStoredAiConfig } from "@/components/ApiKeySettings";
import { MathText } from "@/components/MathText";
import { toFriendlyAiError } from "@/lib/aiErrors";

// ── LOCKED: types + cache key ─────────────────────────────
type Props = {
  subjectName: string;
  topicTitle: string;
  subjectId: string;
  topicId: string;
};

type NotesState =
  | { status: "idle"; text: string }
  | { status: "loading"; text: string }
  | { status: "error"; text: string; error: string };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const notesKey = (subjectId: string, topicId: string) =>
  `gate_ai_v2_notes_${subjectId}__${topicId}`;

// ── Glassmorphism style constants ──────────────────────────
const getGlassPanelClasses = () => "bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.25rem] p-6 shadow-xl";

export function TopicClient({ subjectName, topicTitle, subjectId, topicId }: Props) {
  // ── LOCKED: all state ────────────────────────────────────
  const [notes, setNotes] = useState<NotesState>({ status: "idle", text: "" });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem(notesKey(subjectId, topicId));
    if (cached) setNotes({ status: "idle", text: cached });
  }, [subjectId, topicId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const canStart = useMemo(() => {
    const cfg = getStoredAiConfig();
    return Boolean(cfg.apiKey?.trim());
  }, []);

  // ── LOCKED: generate handler + API call ──────────────────
  const generate = async () => {
    const cfg = getStoredAiConfig();
    if (!cfg.apiKey?.trim()) {
      setNotes({ status: "error", text: "", error: "Missing API key. Go to Settings and paste your key." });
      return;
    }
    setNotes((p) => ({ status: "loading", text: p.text }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          model: cfg.model,
          provider: cfg.provider,
          mode: "notes",
          subject: subjectName,
          topic: topicTitle,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to generate notes");
      const text = String(json.text ?? "");
      localStorage.setItem(notesKey(subjectId, topicId), text);
      setNotes({ status: "idle", text });
      // Reset chat when new notes are generated
      setChatMessages([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setNotes({ status: "error", text: "", error: toFriendlyAiError(msg) });
    }
  };

  // ── Chat send handler ──────────────────────────────────
  const sendChat = useCallback(async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const cfg = getStoredAiConfig();
    if (!cfg.apiKey?.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: message };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    // Build history: start with the notes as system context, then prior chat
    const chatHistory: ChatMessage[] = [
      { role: "assistant", content: notes.text },
      ...chatMessages,
      userMsg,
    ];

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          model: cfg.model,
          provider: cfg.provider,
          mode: "chat",
          subject: subjectName,
          topic: topicTitle,
          chatHistory,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Chat failed");
      const text = String(json.text ?? "");
      setChatMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${toFriendlyAiError(msg)}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, notes.text, subjectName, topicTitle]);

  const notesGenerated = notes.text && notes.status !== "loading";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* ── REVISION NOTES PANEL (full width) ────────── */}
      <motion.section
        className={getGlassPanelClasses()}
        whileHover={{
          boxShadow:
            "0 0 0 1px rgba(109,40,217,0.35), 0 0 48px rgba(109,40,217,0.18), 0 8px 60px rgba(0,0,0,0.5)",
          y: -3,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              className="text-[#f1f5f9]"
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Revision Notes
            </h2>
            {notes.text && notes.status === "idle" && (
              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(16,185,129,0.8)",
                }}
              >
                Cached
              </div>
            )}
          </div>

        </div>

        {/* ── LOCKED: onClick + disabled ─ */}
        <button
          onClick={generate}
          className={notes.status === "loading" ? "btn-secondary loading-pulse" : "btn-primary"}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.75rem 1.25rem",
            fontSize: "0.875rem",
            borderRadius: "0.75rem",
          }}
          disabled={notes.status === "loading"}
        >
          {notes.status === "loading"
            ? "Generating..."
            : notes.text
              ? "Regenerate Notes"
              : "Generate Notes"}
        </button>

        {/* Error state */}
        {notes.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "0.75rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)",
              padding: "0.75rem",
              fontSize: "0.8rem",
              color: "#fca5a5",
            }}
          >
            {notes.error}
          </motion.div>
        )}

        {/* Notes content area */}
        <div
          className="bg-black/20 border-white/5 text-gray-100"
          style={{
            marginTop: "1rem",
            borderRadius: "0.75rem",
            borderWidth: "1px",
            padding: "1.25rem",
            minHeight: "12rem",
          }}
        >
          {notes.text ? (
            <MathText text={notes.text} />
          ) : (
            <div
              className="text-slate-400/60"
              style={{
                fontSize: "0.83rem",
                lineHeight: 1.6,
              }}
            >
              Click{" "}
              <span style={{ color: "#c4b5fd", fontWeight: 600 }}>Generate Notes</span>
              . Notes are cached per topic in your browser.
            </div>
          )}
        </div>

        {/* ── CHAT SECTION (visible after notes generated) ─── */}
        {notesGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: "1.25rem" }}
          >
            {/* Chat messages area */}
            {chatMessages.length > 0 && (
              <div
                className="bg-black/15 border-white/5"
                style={{
                  maxHeight: "24rem",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  borderWidth: "1px",
                }}
              >
                {chatMessages.map((msg, i) => {
                  const isUser = msg.role === "user";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                      }}
                    >
                      <div
                        className={isUser ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white border-violet-500/30" : "bg-white/5 border-white/10 text-slate-200"}
                        style={{
                          padding: "0.65rem 0.9rem",
                          borderRadius: isUser
                            ? "0.75rem 0.75rem 0.2rem 0.75rem"
                            : "0.75rem 0.75rem 0.75rem 0.2rem",
                          borderWidth: "1px",
                          fontSize: "0.83rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {isUser ? msg.content : <MathText text={msg.content} />}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loading indicator for chat */}
                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      alignSelf: "flex-start",
                      padding: "0.65rem 0.9rem",
                      borderRadius: "0.75rem 0.75rem 0.75rem 0.2rem",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "0.83rem",
                      color: "rgba(148,163,184,0.7)",
                    }}
                  >
                    <span className="loading-pulse">Thinking...</span>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Chat input */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder="Ask a follow-up question..."
                disabled={chatLoading}
                className="bg-[#050505] text-[#e2e8f0] border-white/10"
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  fontSize: "0.85rem",
                  borderRadius: "0.75rem",
                  borderWidth: "1px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="btn-primary"
                style={{
                  padding: "0.7rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send
              </button>
            </div>

          </motion.div>
        )}
      </motion.section>

      {/* ── LET'S PRACTICE (below notes) ────────────── */}
      <div style={{ marginTop: "0.25rem" }}>
        {/* ── LOCKED: href ─ */}
        <Link
          href={`/subject/${subjectId}/topic/${topicId}/practice`}
          className="btn-cyan"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.875rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: "0.875rem",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Let&apos;s Practice
        </Link>

        {!canStart ? (
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.78rem",
              color: "rgba(148,163,184,0.65)",
              textAlign: "center",
            }}
          >
            Add your AI key in{" "}
            {/* ── LOCKED: href ─ */}
            <Link
              href="/settings"
              style={{
                color: "rgba(196,181,253,0.9)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Settings
            </Link>{" "}
            first.
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
