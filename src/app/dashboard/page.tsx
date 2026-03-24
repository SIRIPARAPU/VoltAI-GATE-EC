"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider";
import { SUBJECTS } from "@/data/subjects";
import playlistVideoIds from "@/data/playlistVideoIds.json";

type PlaylistData = Record<string, { playlistId: string; videoIds: string[] }>;
const PLAYLIST = playlistVideoIds as PlaylistData;

// ── Stat Card ────────────────────────────────────────────────
function StatCard({
  label, value, sub, color, delay = 0,
}: {
  label: string; value: string | number; sub?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}22`,
        borderTop: `2px solid ${color}55`,
        borderRadius: "1.125rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>
        {label}
      </div>
      <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.45)", fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

// ── Progress Bar ─────────────────────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: "99px" }}
      />
    </div>
  );
}

// ── Weekly Activity Chart ─────────────────────────────────────
function WeeklyChart({ activity }: { activity: Record<string, number> }) {
  const days: { label: string; date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const short = d.toLocaleDateString("en", { weekday: "short" });
    days.push({ label: short, date, count: activity[date] || 0 });
  }
  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: "64px" }}>
      {days.map((d) => (
        <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
          <div
            style={{
              width: "100%",
              height: `${Math.max(4, (d.count / maxCount) * 48)}px`,
              borderRadius: "3px 3px 0 0",
              background: d.count > 0
                ? `linear-gradient(180deg, #7c3aed, #22d3ee)`
                : "rgba(255,255,255,0.06)",
              transition: "height 0.6s ease",
              boxShadow: d.count > 0 ? "0 0 8px rgba(124,58,237,0.4)" : "none",
            }}
          />
          <div style={{ fontSize: "0.55rem", color: "rgba(148,163,184,0.4)", fontWeight: 600, letterSpacing: "0.04em" }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { progress, getSubjectProgress, getTopicAccuracy } = useProgress();

  // ── Aggregate stats
  const allVideoIds = SUBJECTS.flatMap(s => PLAYLIST[s.id]?.videoIds ?? []);
  const totalLectures = allVideoIds.length;
  const completedLectures = SUBJECTS.reduce((acc, s) => {
    const subjVideos = PLAYLIST[s.id]?.videoIds ?? [];
    const subjDone = Object.keys(progress.lectures[s.id] || {}).filter(k => progress.lectures[s.id][k]).length;
    return acc + Math.min(subjDone, subjVideos.length);
  }, 0);

  const allTopics = Object.entries(progress.topics);
  const topicsAttempted = allTopics.filter(([, t]) => t.attempts > 0).length;
  const totalCorrect = allTopics.reduce((acc, [, t]) => acc + t.correct, 0);
  const totalAttempts = allTopics.reduce((acc, [, t]) => acc + t.attempts, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const activeDays = Object.values(progress.weeklyActivity).filter(v => v > 0).length;

  const weakZones = allTopics
    .map(([id, t]) => ({ id, accuracy: t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0, attempts: t.attempts }))
    .filter(z => z.attempts >= 5 && z.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  const totalQuestionsAnswered = totalAttempts;

  // ── Subject progress data
  const subjectData = SUBJECTS.map((s) => {
    const videos = PLAYLIST[s.id]?.videoIds ?? [];
    const { completed, percent } = getSubjectProgress(s.id, videos.length);
    const topicIds = Object.keys(progress.topics).filter(k => k.startsWith(s.id));
    const subjectAccuracy = topicIds.length > 0
      ? Math.round(topicIds.reduce((acc, k) => acc + getTopicAccuracy(k), 0) / topicIds.length)
      : null;
    return { subject: s, videos: videos.length, completed, percent, accuracy: subjectAccuracy };
  });

  const SUBJECT_COLORS = [
    "#7c3aed", "#06b6d4", "#f59e0b", "#10b981",
    "#8b5cf6", "#ec4899", "#22d3ee", "#f97316",
    "#6366f1", "#14b8a6",
  ];

  return (
    <main className="min-h-screen" style={{ position: "relative" }}>
      {/* Background decoration */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
          <defs>
            <pattern id="db-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 H30 V10 H50 V40 H80" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
              <path d="M40 0 V25 H60 V55 H40 V80" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
              <circle cx="30" cy="10" r="1.5" fill="#7c3aed" />
              <circle cx="50" cy="40" r="1.5" fill="#22d3ee" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#db-circuit)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>

        {/* ── Header ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: "2.5rem" }}>
          <Link href="/" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.25rem" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Home
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(124,58,237,0.8)", marginBottom: "0.4rem" }}>
                VoltAi
              </div>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f1f5f9", margin: 0, lineHeight: 1.1 }}>
                Dashboard
              </h1>
            </div>
            <Link href="/world"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: "0.875rem", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", transition: "all 0.2s ease" }}
              className="hover:bg-violet-900/20"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Enter World
            </Link>
          </div>
        </motion.div>

        {/* ── Overview Stats ────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }} className="dashboard-stats-grid">
          <StatCard label="Lectures Done"     value={completedLectures}      sub={`of ${totalLectures} total`}  color="#c4b5fd" delay={0.05} />
          <StatCard label="Questions"         value={totalQuestionsAnswered} sub="total answered"               color="#67e8f9" delay={0.10} />
          <StatCard label="Accuracy"          value={`${overallAccuracy}%`}  sub={`${topicsAttempted} topics`} color="#34d399" delay={0.15} />
          <StatCard label="Active Days"       value={activeDays}             sub="all time"                     color="#fb923c" delay={0.20} />
        </div>

        {/* ── Main grid: Subject Progress + Side panels ─────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }} className="dashboard-main-grid">

          {/* LEFT: Subject progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
            style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.75rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.7)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>
                Subject Progress
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {subjectData.map(({ subject, videos, completed, percent, accuracy }, i) => (
                <div key={subject.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flex: 1, minWidth: 0 }}>
                      {/* Color dot */}
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: SUBJECT_COLORS[i], flexShrink: 0, boxShadow: `0 0 8px ${SUBJECT_COLORS[i]}80` }} />
                      <Link
                        href={`/subject/${subject.id}`}
                        style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.15s" }}
                        className="hover:text-white"
                      >
                        {subject.name}
                      </Link>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", flexShrink: 0, alignItems: "center" }}>
                      {accuracy !== null && (
                        <span style={{ fontSize: "0.7rem", color: accuracy >= 70 ? "#34d399" : accuracy >= 50 ? "#fb923c" : "#f87171", fontWeight: 600 }}>
                          {accuracy}% acc
                        </span>
                      )}
                      <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-geist-mono)", color: "rgba(148,163,184,0.55)", minWidth: "4.5rem", textAlign: "right" }}>
                        {completed}/{videos}
                      </span>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700, color: SUBJECT_COLORS[i],
                        minWidth: "2.75rem", textAlign: "right",
                      }}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar pct={percent} color={`linear-gradient(90deg, ${SUBJECT_COLORS[i]}, ${SUBJECT_COLORS[(i + 3) % SUBJECT_COLORS.length]})`} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Weak zones + Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Weak Zones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "1.25rem", padding: "1.5rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.125rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,113,113,0.65)" }}>
                  Weak Zones
                </span>
              </div>

              {weakZones.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem", borderRadius: "0.75rem", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 500 }}>No weak zones — great work!</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {weakZones.slice(0, 5).map(z => (
                    <div key={z.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.625rem", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)" }}>
                      <span style={{ fontSize: "0.75rem", color: "rgba(252,165,165,0.85)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {z.id.replace(/-/g, " ")}
                      </span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: z.accuracy < 40 ? "#f87171" : "#fb923c", flexShrink: 0 }}>
                        {z.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.125rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.7)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>
                  Weekly Activity
                </span>
              </div>
              <WeeklyChart activity={progress.weeklyActivity} />
            </motion.div>

            {/* Quick nav to all subjects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem" }}
            >
              <div style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)", marginBottom: "1rem" }}>
                Quick Access
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {SUBJECTS.map((s, i) => (
                  <Link
                    key={s.id}
                    href={`/subject/${s.id}`}
                    style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", textDecoration: "none", transition: "background 0.15s ease" }}
                    className="list-item-hover"
                  >
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: SUBJECT_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: "0.78rem", color: "rgba(203,213,225,0.75)", fontWeight: 500 }}>{s.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
