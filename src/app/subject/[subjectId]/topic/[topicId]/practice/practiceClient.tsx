"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getStoredAiConfig } from "@/components/ApiKeySettings";
import { MathText } from "@/components/MathText";
import { toFriendlyAiError } from "@/lib/aiErrors";

type Q =
  | {
      id: string;
      type: "mcq";
      question: string;
      options: [string, string, string, string];
      answer: "A" | "B" | "C" | "D";
      solution: string;
    }
  | {
      id: string;
      type: "numerical";
      question: string;
      answer: string;
      solution: string;
    };

function safeJsonParse(text: string) {
  let s = String(text ?? "");

  // Strip markdown fences if model wrapped JSON in ```json ... ```.
  s = s.replace(/```json/gi, "").replace(/```/g, "");

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    s = s.slice(start, end + 1);
  }

  // Remove trailing commas before } or ] which often sneak in.
  s = s.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(s);
}

export function PracticeClient({ subjectName, topicTitle }: { subjectName: string; topicTitle: string }) {
  const cfg = useMemo(() => getStoredAiConfig(), []);
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);

  const current = questions[idx];

  const start = async () => {
    setError(null);
    setLoadingHint(null);
    if (!cfg.apiKey?.trim()) {
      setError("Missing API key. Go to Settings and paste your key.");
      return;
    }
    setLoading(true);
    setLoadingHint("Generating 30 questions... this can take a bit.");

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoadingHint("Still generating... please wait ~20-30 seconds.");
    }, 10000);
    const hardTimeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          model: cfg.model,
          provider: cfg.provider,
          mode: "questions",
          subject: subjectName,
          topic: topicTitle,
          previousQuestions: sessionHistory,
        }),
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to generate questions");

      const parsed = safeJsonParse(String(json.text ?? ""));
      const qs: Q[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
      if (qs.length !== 30) throw new Error("Could not get a complete 30-question set. Click Generate 30 again.");

      const newHistory = [
        ...sessionHistory,
        ...qs.map((q) => (typeof q?.question === "string" ? q.question : "")).filter(Boolean),
      ];

      setSessionHistory(newHistory);
      setQuestions(qs);
      setIdx(0);
      setSelected(null);
      setShowSolution(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(toFriendlyAiError(msg));
    } finally {
      setLoading(false);
      setLoadingHint(null);
      clearTimeout(timeout);
      clearTimeout(hardTimeout);
    }
  };

  const choose = (ans: string) => {
    if (!current) return;
    if (selected) return;
    setSelected(ans);
    setShowSolution(false);
  };

  const isCorrect = useMemo(() => {
    if (!current || !selected) return null;
    if (current.type === "mcq") return selected === current.answer;
    return String(selected).trim() === String(current.answer).trim();
  }, [current, selected]);

  const next = () => {
    setSelected(null);
    setShowSolution(false);
    setIdx((i) => Math.min(questions.length - 1, i + 1));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-300">
              {questions.length ? `Question ${idx + 1} / ${questions.length}` : "No active set"}
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Practice Set</h2>
          </div>
          <button
            onClick={start}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating..." : questions.length ? "Regenerate 30" : "Generate 30"}
          </button>
        </div>
        {loadingHint ? <div className="mt-2 text-sm text-zinc-300">{loadingHint}</div> : null}

        {error ? (
          <div className="mt-3 rounded-2xl border border-red-300/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        {!current ? (
          <div className="mt-4 text-sm text-zinc-300">Click “Generate 30” to start.</div>
        ) : (
          <div className="mt-4 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${idx}-${current?.id ?? ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-white/10 bg-black/10 p-4"
              >
                <MathText text={current.question} />
              </motion.div>
            </AnimatePresence>

            {current.type === "mcq" ? (
              <div className="grid gap-2">
                {(["A", "B", "C", "D"] as const).map((label, i) => {
                  const option = current.options[i];
                  const picked = selected === label;
                  const correct = current.answer === label;
                  const color =
                    selected == null
                      ? "border-zinc-200"
                      : picked && correct
                        ? "border-green-400 bg-green-50"
                        : picked && !correct
                          ? "border-red-400 bg-red-50"
                          : correct
                            ? "border-green-200"
                            : "border-zinc-200";

                  return (
                    <button
                      key={label}
                      onClick={() => choose(label)}
                      className={`w-full rounded-2xl border p-3 text-left hover:bg-white/5 ${color}`}
                      disabled={!!selected}
                    >
                      <div className="text-sm font-medium">{label}.</div>
                      <div className="mt-1 text-sm text-zinc-50">
                        <MathText text={String(option ?? "")} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <label className="grid gap-1">
                  <span className="text-sm text-zinc-300">Your numerical answer</span>
                  <input
                    className="w-48 rounded-xl border border-white/10 bg-black/10 px-3 py-2 font-mono text-zinc-100"
                    onChange={(e) => setSelected(e.target.value)}
                    value={selected ?? ""}
                    placeholder="e.g., 3.14"
                    disabled={!!selected && isCorrect !== null}
                  />
                </label>
                <button
                  onClick={() => {
                    if (!selected) return;
                    setSelected(selected);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
                >
                  Check
                </button>
                {isCorrect !== null ? (
                  <div className={`text-sm ${isCorrect ? "text-green-200" : "text-red-200"}`}>
                    {isCorrect ? "Correct" : "Wrong"}
                  </div>
                ) : null}
              </div>
            )}

            {selected ? (
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${isCorrect ? "text-green-200" : "text-red-200"}`}>
                  {isCorrect ? "Correct" : "Wrong"}
                </div>
                {!isCorrect ? (
                  <button
                    onClick={() => setShowSolution((v) => !v)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 hover:bg-white/10"
                  >
                    {showSolution ? "Hide Solution" : "View Solution"}
                  </button>
                ) : null}
                <button
                  onClick={next}
                  className="ml-auto rounded-xl bg-[#6D28D9] px-3 py-1.5 text-sm text-white hover:bg-[#5B21B6]"
                  disabled={idx >= questions.length - 1}
                >
                  Next
                </button>
              </div>
            ) : null}

            {showSolution && current.solution ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-black/10 p-4"
              >
                <div className="mb-2 text-sm font-medium text-zinc-100">Solution</div>
                <MathText text={current.solution} />
              </motion.div>
            ) : null}
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="font-medium text-zinc-100">Rules</div>
        <ul className="mt-2 space-y-2 text-sm text-zinc-300">
          <li>30 questions per set</li>
          <li>Strictly topic-only</li>
          <li>No repetition within session</li>
          <li>No video completion tracking</li>
        </ul>
      </aside>
    </div>
  );
}

