"use client";

import { useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getStoredAiConfig } from "@/components/ApiKeySettings";
import { MathText } from "@/components/MathText";
import { toFriendlyAiError } from "@/lib/aiErrors";
import { useProgress } from "@/components/ProgressProvider";

// ── LOCKED: types ─────────────────────────────────────────
type Q =
  | {
      id: string;
      type: "mcq";
      question: string;
      options: [string, string, string, string];
      answer: "A" | "B" | "C" | "D";
      solution: string;
      diagram?: string;
    }
  | {
      id: string;
      type: "numerical";
      question: string;
      answer: string;
      solution: string;
      diagram?: string;
    };

// ── Diagram renderer (ASCII text diagram in a styled box) ──
function DiagramBox({ text }: { text: string }) {
  return (
    <div style={{
      marginTop: "0.75rem",
      padding: "1rem",
      borderRadius: "0.75rem",
      background: "rgba(124,58,237,0.06)",
      border: "1px solid rgba(124,58,237,0.2)",
      fontFamily: "var(--font-geist-mono), monospace",
      fontSize: "0.75rem",
      color: "#c4b5fd",
      lineHeight: 1.6,
      whiteSpace: "pre-wrap",
      overflowX: "auto",
    }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(124,58,237,0.6)", marginBottom: "0.5rem" }}>
        Circuit / Diagram
      </div>
      {text}
    </div>
  );
}

// ── LOCKED: utility function ──────────────────────────────
function safeJsonParse(text: string) {
  let s = String(text ?? "");
  s = s.replace(/```json/gi, "").replace(/```/g, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  s = s.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(s);
}

// MCQ option color logic
function getOptionStyle(
  label: string,
  selected: string | null,
  correct: string,
  pendingAnswer?: string | null
) {
  // Before submission: show pending highlight
  if (selected == null) {
    if (pendingAnswer === label) {
      return {
        border: "1px solid rgba(139,92,246,0.7)",
        background: "rgba(139,92,246,0.12)",
        color: "#c4b5fd",
        boxShadow: "0 0 12px rgba(139,92,246,0.15)",
      };
    }
    return {
      border: "1px solid rgba(255,255,255,0.13)",
      background: "rgba(255,255,255,0.02)",
      color: "#e2e8f0",
    };
  }
  const picked = selected === label;
  const isCorrect = label === correct;

  if (picked && isCorrect) {
    return {
      border: "1px solid rgba(16,185,129,0.6)",
      background: "rgba(16,185,129,0.12)",
      color: "#6ee7b7",
      boxShadow: "0 0 16px rgba(16,185,129,0.15)",
    };
  }
  if (picked && !isCorrect) {
    return {
      border: "1px solid rgba(239,68,68,0.5)",
      background: "rgba(239,68,68,0.10)",
      color: "#fca5a5",
    };
  }
  if (!picked && isCorrect) {
    return {
      border: "1px solid rgba(16,185,129,0.35)",
      background: "rgba(16,185,129,0.05)",
      color: "#e2e8f0",
    };
  }
  return {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(0,0,0,0.1)",
    color: "rgba(148,163,184,0.6)",
  };
}

export function PracticeClient({
  subjectName,
  topicTitle,
  topicId,
}: {
  subjectName: string;
  topicTitle: string;
  topicId: string; // added to identify the topic in progress
}) {
  const { recordPractice } = useProgress();
  // ── LOCKED: all state ────────────────────────────────────
  const cfg = useMemo(() => getStoredAiConfig(), []);
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  
  // Numerical input draft state
  const [numericalDraft, setNumericalDraft] = useState("");
  // MCQ pending selection (before submit)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);

  const current = questions[idx];

  // ── LOCKED: start handler + API call ─────────────────────
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
      if (qs.length !== 30)
        throw new Error("Could not get a complete 30-question set. Click Generate 30 again.");
      const newHistory = [
        ...sessionHistory,
        ...qs.map((q) => (typeof q?.question === "string" ? q.question : "")).filter(Boolean),
      ];
      setSessionHistory(newHistory);
      setQuestions(qs);
      setIdx(0);
      setSelected(null);
      setPendingAnswer(null);
      setNumericalDraft("");
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

  // ── check Answer and record analytics ────────────────────
  const submitAnswer = (ans: string) => {
    if (!current || selected) return;
    setSelected(ans);
    setShowSolution(false);
    
    // Evaluate correctness
    let correct = false;
    if (current.type === "mcq") {
      correct = ans === current.answer;
    } else {
      correct = String(ans).trim() === String(current.answer).trim();
    }
    
    // Record globally
    recordPractice(topicId, correct);
  };

  const isCorrect = useMemo(() => {
    if (!current || !selected) return null;
    if (current.type === "mcq") return selected === current.answer;
    return String(selected).trim() === String(current.answer).trim();
  }, [current, selected]);

  const next = () => {
    setSelected(null);
    setPendingAnswer(null);
    setNumericalDraft("");
    setShowSolution(false);
    setIdx((i) => Math.min(questions.length - 1, i + 1));
  };
  // ─────────────────────────────────────────────────────────

  const progress = questions.length ? ((idx + 1) / questions.length) * 100 : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* ══════════════════════════════════════════════════
          MAIN PRACTICE PANEL
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTopColor: "rgba(255,255,255,0.16)",
          borderRadius: "1.5rem",
          padding: "1.25rem",
          boxShadow:
            "0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
        className="lg:col-span-2"
      >
        {/* Header row */}
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
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.6)",
                marginBottom: "0.2rem",
              }}
            >
              {questions.length
                ? `Question ${idx + 1} / ${questions.length}`
                : "No active set"}
            </div>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.01em",
              }}
            >
              Practice Set
            </h2>
          </div>

          {/* ── LOCKED: onClick + disabled ─ */}
          <button
            onClick={start}
            className={loading ? "btn-secondary loading-pulse" : "btn-primary"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : questions.length
              ? "Regenerate 30"
              : "Generate 30"}
          </button>
        </div>

        {/* Progress bar */}
        {questions.length > 0 && (
          <div
            style={{
              marginTop: "0.85rem",
              height: 3,
              borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #7C3AED, #22d3ee)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        )}

        {/* Loading hint */}
        {loadingHint && (
          <div
            style={{
              marginTop: "0.6rem",
              fontSize: "0.78rem",
              color: "rgba(196,181,253,0.7)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#7C3AED",
                animation: "neonPulse 1.2s ease-in-out infinite",
              }}
            />
            {loadingHint}
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "0.85rem",
              borderRadius: "0.85rem",
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.08)",
              padding: "0.85rem",
              fontSize: "0.8rem",
              color: "#fca5a5",
            }}
          >
            {error}
          </motion.div>
        )}

        {!current ? (
          <div
            style={{
              marginTop: "1.5rem",
              fontSize: "0.85rem",
              color: "rgba(148,163,184,0.55)",
              textAlign: "center",
              padding: "2rem 0",
            }}
          >
            Click{" "}
            <span style={{ color: "#c4b5fd", fontWeight: 600 }}>
              Generate 30
            </span>{" "}
            to start.
          </div>
        ) : (
          <div style={{ marginTop: "1.25rem", display: "grid", gap: "1rem" }}>
            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${idx}-${current?.id ?? ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                style={{
                  borderRadius: "0.85rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.22)",
                  padding: "1rem",
                }}
              >
                <MathText text={current.question} />
                {current.diagram && <DiagramBox text={current.diagram} />}
              </motion.div>
            </AnimatePresence>

            {/* MCQ Options */}
            {current.type === "mcq" ? (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {(["A", "B", "C", "D"] as const).map((label, i) => {
                  const option = current.options[i];
                  const optStyle = getOptionStyle(label, selected, current.answer, pendingAnswer);

                  return (
                    <button
                      key={label}
                      onClick={() => { if (!selected) setPendingAnswer(label); }}
                      disabled={!!selected}
                      style={{
                        width: "100%",
                        borderRadius: "0.85rem",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        cursor: selected ? "default" : "pointer",
                        transition:
                          "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                        ...optStyle,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            minWidth: 22,
                            height: 22,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            background: "rgba(255,255,255,0.08)",
                            color: "inherit",
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </span>
                        <div style={{ fontSize: "0.875rem" }}>
                          <MathText text={String(option ?? "")} />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {/* Submit button for MCQ - only shows when an option is pending and not yet evaluated */}
                {pendingAnswer && !selected && (
                  <button
                    onClick={() => submitAnswer(pendingAnswer)}
                    className="btn-primary active-compress"
                    style={{
                      marginTop: "0.25rem",
                      padding: "0.55rem 1.5rem",
                      fontSize: "0.85rem",
                      borderRadius: "99px",
                      justifySelf: "start",
                    }}
                  >
                    Submit
                  </button>
                )}
              </div>
            ) : (
              /* Numerical input */
              <div
                style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(148,163,184,0.65)",
                    }}
                  >
                    Your numerical answer
                  </span>
                  <input
                    className="input-neon font-mono"
                    style={{ padding: "0.55rem 0.85rem", fontSize: "0.875rem", width: "12rem" }}
                    onChange={(e) => setNumericalDraft(e.target.value)}
                    value={selected ?? numericalDraft}
                    placeholder="e.g., 3.14"
                    disabled={!!selected}
                  />
                </label>
                <button
                  onClick={() => {
                    if (!numericalDraft.trim() || selected) return;
                    submitAnswer(numericalDraft.trim());
                  }}
                  className="btn-secondary"
                  style={{ padding: "0.55rem 1rem", fontSize: "0.8rem" }}
                  disabled={!numericalDraft.trim() || !!selected}
                >
                  Check
                </button>
                {isCorrect !== null && (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: isCorrect ? "#6ee7b7" : "#fca5a5",
                    }}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </div>
                )}
              </div>
            )}

            {/* Result row */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    paddingTop: "0.5rem",
                    marginTop: "0.5rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: isCorrect ? "#34d399" : "#fb7185",
                      textShadow: isCorrect ? "0 0 12px rgba(52,211,153,0.3)" : "0 0 12px rgba(251,113,133,0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    {isCorrect ? (
                      <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> CORRECT!</>
                    ) : (
                      <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> INCORRECT</>
                    )}
                  </div>

                  {/* ── LOCKED: onClick ─ */}
                  {!isCorrect && (
                    <button
                      onClick={() => setShowSolution((v) => !v)}
                      className="btn-secondary active-compress"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", borderRadius: "99px" }}
                    >
                      {showSolution ? "Hide Explanation" : "Reveal AI Solution ✦"}
                    </button>
                  )}

                  {/* ── LOCKED: onClick + disabled ─ */}
                  <button
                    onClick={next}
                    className="btn-primary active-compress"
                    style={{
                      marginLeft: "auto",
                      padding: "0.45rem 1.25rem",
                      fontSize: "0.85rem",
                    }}
                    disabled={idx >= questions.length - 1}
                  >
                    Next Question →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solution */}
            <AnimatePresence>
              {showSolution && current.solution && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      borderRadius: "1rem",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.3)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.2)",
                      padding: "1.25rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "0.75rem",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(196,181,253,0.9)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Step-by-Step AI Solution
                    </div>
                    <MathText text={current.solution} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          RULES SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside
        style={{
          background:
            "linear-gradient(135deg, rgba(109,40,217,0.10) 0%, rgba(6,182,212,0.05) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(109,40,217,0.22)",
          borderRadius: "1.5rem",
          padding: "1.25rem",
          boxShadow:
            "0 0 32px rgba(109,40,217,0.08), 0 4px 24px rgba(0,0,0,0.4)",
          alignSelf: "start",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.8)",
            marginBottom: "1rem",
          }}
        >
          Rules
        </div>

        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.6rem" }}>
          {[
            "30 questions per set",
            "Strictly topic-only",
            "No repetition within session",
            "No video completion tracking",
          ].map((rule) => (
            <li
              key={rule}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.82rem",
                color: "rgba(148,163,184,0.8)",
                padding: "0.45rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span
                style={{
                  marginTop: 3,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED, #22d3ee)",
                  boxShadow: "0 0 6px rgba(109,40,217,0.6)",
                  flexShrink: 0,
                }}
              />
              {rule}
            </li>
          ))}
        </ul>

        {/* Session info */}
        {sessionHistory.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.65rem",
              borderRadius: "0.65rem",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.05)",
              fontSize: "0.72rem",
              color: "rgba(148,163,184,0.6)",
            }}
          >
            Session: {sessionHistory.length} unique questions seen
          </div>
        )}
      </aside>
    </div>
  );
}
