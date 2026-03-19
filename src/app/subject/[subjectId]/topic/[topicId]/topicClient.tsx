"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const notesKey = (subjectId: string, topicId: string) =>
  `gate_ai_v2_notes_${subjectId}__${topicId}`;

export function TopicClient({ subjectName, topicTitle, subjectId, topicId }: Props) {
  // ── LOCKED: all state ────────────────────────────────────
  const [notes, setNotes] = useState<NotesState>({ status: "idle", text: "" });

  useEffect(() => {
    const cached = localStorage.getItem(notesKey(subjectId, topicId));
    if (cached) setNotes({ status: "idle", text: cached });
  }, [subjectId, topicId]);

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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setNotes({ status: "error", text: "", error: toFriendlyAiError(msg) });
    }
  };
  // ─────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-5 lg:grid-cols-2"
    >
      {/* ── REVISION NOTES PANEL ─────────────────────── */}
      <motion.section
        whileHover={{
          boxShadow:
            "0 0 0 1px rgba(109,40,217,0.35), 0 0 48px rgba(109,40,217,0.18), 0 8px 60px rgba(0,0,0,0.5)",
          y: -3,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTopColor: "rgba(255,255,255,0.16)",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
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
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#f1f5f9",
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
                ✓ Cached
              </div>
            )}
          </div>

          {/* ── LOCKED: onClick + disabled ─ */}
          <button
            onClick={generate}
            className={notes.status === "loading" ? "btn-secondary loading-pulse" : "btn-primary"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
            disabled={notes.status === "loading"}
          >
            {notes.status === "loading" ? "Generating..." : "Generate Notes"}
          </button>
        </div>

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
          style={{
            marginTop: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)",
            padding: "0.85rem",
            minHeight: "8rem",
          }}
        >
          {notes.text ? (
            <MathText text={notes.text} />
          ) : (
            <div
              style={{
                fontSize: "0.83rem",
                color: "rgba(148,163,184,0.6)",
                lineHeight: 1.6,
              }}
            >
              Click{" "}
              <span style={{ color: "#c4b5fd", fontWeight: 600 }}>Generate Notes</span>
              . Notes are cached per topic in your browser.
            </div>
          )}
        </div>
      </motion.section>

      {/* ── PRACTICE PANEL ───────────────────────────── */}
      <motion.section
        whileHover={{
          boxShadow:
            "0 0 0 1px rgba(6,182,212,0.3), 0 0 48px rgba(6,182,212,0.12), 0 8px 60px rgba(0,0,0,0.5)",
          y: -3,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(6,182,212,0.15)",
          borderTopColor: "rgba(6,182,212,0.25)",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      >
        <h2
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.01em",
          }}
        >
          Practice
        </h2>
        <p
          style={{
            marginTop: "0.35rem",
            fontSize: "0.82rem",
            color: "rgba(148,163,184,0.75)",
            lineHeight: 1.55,
          }}
        >
          After quick revision, start a strict topic-only practice set.
        </p>

        <div style={{ marginTop: "1.25rem" }}>
          {/* ── LOCKED: href ─ */}
          <Link
            href={`/subject/${subjectId}/topic/${topicId}/practice`}
            className="btn-cyan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.25rem",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Practice
          </Link>
        </div>

        {!canStart ? (
          <div
            style={{
              marginTop: "0.85rem",
              fontSize: "0.78rem",
              color: "rgba(148,163,184,0.65)",
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
      </motion.section>
    </motion.div>
  );
}
