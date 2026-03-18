"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getStoredAiConfig } from "@/components/ApiKeySettings";
import { MathText } from "@/components/MathText";
import { toFriendlyAiError } from "@/lib/aiErrors";

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

// Versioned key so we can change formatting rules without stale cache.
const notesKey = (subjectId: string, topicId: string) => `gate_ai_v2_notes_${subjectId}__${topicId}`;

export function TopicClient({ subjectName, topicTitle, subjectId, topicId }: Props) {
  const [notes, setNotes] = useState<NotesState>({ status: "idle", text: "" });

  useEffect(() => {
    const cached = localStorage.getItem(notesKey(subjectId, topicId));
    if (cached) setNotes({ status: "idle", text: cached });
  }, [subjectId, topicId]);

  const canStart = useMemo(() => {
    const cfg = getStoredAiConfig();
    return Boolean(cfg.apiKey?.trim());
  }, []);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-6 lg:grid-cols-2"
    >
      <motion.section
        whileHover={{ boxShadow: "0 0 40px rgba(109,40,217,0.18)" }}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Revision Notes</h2>
          <button
            onClick={generate}
            className="rounded-xl bg-[#6D28D9] px-3 py-1.5 text-sm text-white shadow-[0_0_30px_rgba(109,40,217,0.35)] hover:bg-[#5B21B6] disabled:opacity-50"
            disabled={notes.status === "loading"}
          >
            {notes.status === "loading" ? "Generating..." : "Generate Notes"}
          </button>
        </div>

        {notes.status === "error" ? (
          <div className="mt-3 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-200">
            {notes.error}
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
          {notes.text ? (
            <MathText text={notes.text} />
          ) : (
            <div className="text-sm text-zinc-300">
              Click <span className="font-medium">Generate Notes</span>. Notes are cached per topic in your browser.
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        whileHover={{ boxShadow: "0 0 40px rgba(59,130,246,0.14)" }}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
      >
        <h2 className="text-lg font-semibold text-zinc-100">Practice</h2>
        <p className="mt-1 text-sm text-zinc-300">
          After quick revision, start a strict topic-only practice set.
        </p>
        <div className="mt-4">
          <Link
            href={`/subject/${subjectId}/topic/${topicId}/practice`}
            className="inline-flex rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm text-white shadow-[0_0_34px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]"
          >
            Start Practice
          </Link>
        </div>
        {!canStart ? (
          <div className="mt-3 text-sm text-zinc-300">
            Add your AI key in <Link className="underline underline-offset-4" href="/settings">Settings</Link> first.
          </div>
        ) : null}
      </motion.section>
    </motion.div>
  );
}

