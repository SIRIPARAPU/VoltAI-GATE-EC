"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider";
import React, { useState, useEffect } from "react";

// ── Galaxy Star Field ───────────────────────────────────────
type Star = { id: number; top: string; left: string; size: number; dur: string; delay: string; minOp: number; maxOp: number };

function StarField() {
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      dur: `${3 + Math.random() * 5}s`,
      delay: `${Math.random() * 6}s`,
      minOp: 0.1 + Math.random() * 0.15,
      maxOp: 0.5 + Math.random() * 0.5,
    })));
  }, []);
  return (
    <div className="star-field" aria-hidden>
      {stars.map((s) => (
        <div key={s.id} className="star" style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--dur": s.dur, "--delay": s.delay, "--min-op": s.minOp, "--max-op": s.maxOp } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ── Countdown Timer ─────────────────────────────────────────
function DoomsdayTimer() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <div style={{ height: "88px" }} />;
  const target = new Date("2026-12-29T00:00:00+05:30").getTime();
  const diff = target - now;
  const isPast = diff <= 0;
  const days    = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours   = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const isWarning = days < 30;
  const accentColor = isWarning || isPast ? "#f87171" : "#e2e8f0";
  const glowColor   = isWarning || isPast ? "rgba(248,113,113,0.5)" : "rgba(124,58,237,0.3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
    >
      <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: isWarning || isPast ? "#f87171" : "rgba(148,163,184,0.4)" }}>
        {isPast ? "EXAM APPROACHING" : isWarning ? "⚠ EXAM APPROACHING" : "GATE EC 2027"}
      </div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        {[{ value: days, label: "Days" }, { value: hours, label: "Hours" }, { value: minutes, label: "Min" }].map((unit, i) => (
          <div key={unit.label} style={{ textAlign: "center" }}>
            {i > 0 && <span style={{ position: "absolute", marginLeft: "-1.1rem", marginTop: "0.25rem", color: "rgba(148,163,184,0.25)", fontSize: "1.5rem", fontWeight: 300 }}>:</span>}
            <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "var(--font-geist-mono)", color: accentColor, textShadow: `0 0 20px ${glowColor}`, lineHeight: 1, animation: isWarning || isPast ? "neonPulse 2s ease-in-out infinite" : "none" }}>
              {String(unit.value).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)", marginTop: "0.35rem" }}>{unit.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Feature Card Data ───────────────────────────────────────
const FLASH_CARDS = [
  {
    title: "AI Mentor",
    desc: "Context-aware GATE tutor. Understands your current topic and delivers step-by-step solutions with LaTeX math.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: "#a78bfa", glow: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.25)", tag: "Multi-AI",
  },
  {
    title: "Practice Engine",
    desc: "30 GATE-level MCQ & numerical questions per session. Strict topic adherence, real-time grading, instant solutions.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    color: "#67e8f9", glow: "rgba(103,232,249,0.18)", border: "rgba(103,232,249,0.25)", tag: "30 Q/session",
  },
  {
    title: "Subject Universe",
    desc: "10 interactive subject zones in a visual command map. Navigate, track progress, and dive into any topic instantly.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    color: "#c084fc", glow: "rgba(192,132,252,0.18)", border: "rgba(192,132,252,0.25)", tag: "Interactive",
  },
  {
    title: "AI Notes",
    desc: "Generate topic-specific revision notes on demand. LaTeX math rendering, cached in your browser for offline use.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: "#34d399", glow: "rgba(52,211,153,0.18)", border: "rgba(52,211,153,0.25)", tag: "Cached",
  },
  {
    title: "Progress Tracking",
    desc: "Lecture completion, topic accuracy, weak zone detection. Weekly heatmap — all persisted locally, zero backend.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    color: "#fb923c", glow: "rgba(251,146,60,0.18)", border: "rgba(251,146,60,0.25)", tag: "Local DB",
  },
  {
    title: "Multi-AI Support",
    desc: "Connect OpenAI, Groq (free), or Google Gemini. Bring your own key — full flexibility, zero lock-in.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    color: "#f472b6", glow: "rgba(244,114,182,0.18)", border: "rgba(244,114,182,0.25)", tag: "3 Providers",
  },
];

// ── Strategy Data ───────────────────────────────────────────
const STRATEGY_ITEMS = [
  { rank: "01", subject: "Signals & Systems + Network Theory", weight: "~22 marks", tip: "Highest combined weightage. Master Laplace, Fourier transforms, and two-port networks first.", color: "#f87171" },
  { rank: "02", subject: "Electronic Devices + Analog Circuits", weight: "~18 marks", tip: "BJT, MOSFET biasing, op-amps, and feedback amplifiers. Strong theory → easy numericals.", color: "#fb923c" },
  { rank: "03", subject: "Engineering Mathematics", weight: "~15 marks", tip: "Linear algebra, calculus, differential equations. Most GATE questions follow predictable patterns.", color: "#facc15" },
  { rank: "04", subject: "Digital Circuits + Communication", weight: "~14 marks", tip: "Boolean algebra, FSMs, modulation techniques. Quick gains with formula sheets.", color: "#4ade80" },
  { rank: "05", subject: "Control Systems + EMFT", weight: "~11 marks", tip: "Bode plots, root locus, Maxwell's equations. Invest time proportional to your background.", color: "#22d3ee" },
];

// ── Divider ─────────────────────────────────────────────────
function SectionDivider() {
  return <hr className="divider-neon" style={{ margin: "0 1.5rem" }} />;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const { progress } = useProgress();

  const totalLecturesAcrossAll = Object.values(progress.lectures).reduce(
    (acc, subjObj) => acc + Object.keys(subjObj).filter(k => subjObj[k]).length, 0
  );
  const todayStr = new Date().toISOString().split("T")[0];
  const questionsToday = progress.weeklyActivity[todayStr] || 0;
  const topicsPracticed = Object.keys(progress.topics).length;
  const weakZones = Object.entries(progress.topics)
    .map(([topicId, stats]) => {
      const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0;
      return { topicId, accuracy, attempts: stats.attempts };
    })
    .filter(z => z.attempts >= 5 && z.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <main className="min-h-screen" style={{ scrollBehavior: "smooth" }}>
      <StarField />

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "2rem" }}>
        {/* Background */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <div className="gate-bg-animate" style={{ position: "absolute", inset: "-50%", width: "200%", height: "200%", background: "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.18) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12) 0%, transparent 50%)" }} />
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
            <defs><pattern id="circuit" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 H30 V10 H50 V40 H80" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
              <path d="M40 0 V25 H60 V55 H40 V80" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
              <circle cx="30" cy="10" r="2" fill="#7c3aed" opacity="0.5" /><circle cx="50" cy="40" r="2" fill="#22d3ee" opacity="0.5" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
          <div style={{ position: "absolute", top: "15%", left: "10%", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%", opacity: 0.8, transform: "translateZ(0)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)", borderRadius: "50%", opacity: 0.8, transform: "translateZ(0)" }} />
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.007) 2px, rgba(255,255,255,0.007) 4px)", pointerEvents: "none" }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "600px" }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem", padding: "0.4rem 1rem", borderRadius: "99px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.28)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c4b5fd" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", boxShadow: "0 0 8px #7c3aed", animation: "neonPulse 2s infinite" }} />
            GATE EC 2027 · AI Command Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: "clamp(3.5rem, 12vw, 7.5rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, background: "linear-gradient(135deg, #7c3aed 0%, #818cf8 35%, #22d3ee 70%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 50px rgba(124,58,237,0.35))" }}
          >
            VoltAI
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ marginTop: "1.5rem", fontSize: "1.1rem", color: "rgba(203,213,225,0.6)", fontWeight: 400, lineHeight: 1.6 }}
          >
            Your AI-powered GATE EC companion.<br />
            <span style={{ color: "rgba(203,213,225,0.38)", fontSize: "0.9rem" }}>Master GATE EC with AI-powered notes, practice & mentoring.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: "2.75rem", display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/world" className="active-compress hover:scale-105"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.9rem 2.25rem", fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "white", background: "linear-gradient(135deg, #7C3AED, #22d3ee)", borderRadius: "99px", textDecoration: "none", boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(34,211,238,0.12), inset 0 2px 0 rgba(255,255,255,0.18)", animation: "neonPulse 3s ease-in-out infinite" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Enter World
            </Link>
            <Link href="/settings"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.9rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "rgba(196,181,253,0.75)", textDecoration: "none", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: "99px", transition: "all 0.2s ease" }}
              className="hover:bg-violet-900/20 hover:border-violet-500/40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              AI Settings
            </Link>
          </motion.div>

          <div style={{ marginTop: "3.5rem" }}>
            <DoomsdayTimer />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
        >
          <div style={{ fontSize: "0.52rem", letterSpacing: "0.25em", color: "rgba(148,163,184,0.3)", textTransform: "uppercase" }}>Scroll</div>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURE CARDS — 3-col grid, breathable spacing
      ═══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "6rem 1.5rem 0" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: "4rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(124,58,237,0.8)", marginBottom: "0.75rem" }}>
            The Arsenal
          </div>
          <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Platform Features
          </div>
          <div style={{ marginTop: "1rem", fontSize: "1rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6, maxWidth: "600px", marginInline: "auto" }}>
            Built for serious GATE EC aspirants — AI-first, locally-private, exam-focused.
          </div>
        </motion.div>

        {/* 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.125rem" }} className="feature-cards-grid">
          {FLASH_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${card.glow}` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative", overflow: "hidden",
                background: "rgba(255,255,255,0.035)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${card.border}`,
                borderTopColor: `${card.color}22`,
                borderRadius: "1.25rem",
                padding: "1.75rem",
                minHeight: "220px",
                display: "flex", flexDirection: "column", gap: "1rem",
                cursor: "default",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
              }}
            >
              {/* Top-right glow */}
              <div style={{ position: "absolute", top: 0, right: 0, width: "140px", height: "140px", background: `radial-gradient(circle at top right, ${card.glow} 0%, transparent 65%)`, pointerEvents: "none", borderRadius: "inherit" }} />

              {/* Icon */}
              <div style={{ width: "44px", height: "44px", borderRadius: "0.875rem", background: `${card.glow}`, border: `1px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0, boxShadow: `0 0 20px ${card.glow}` }}>
                {card.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ fontSize: "0.975rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{card.title}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.68)", lineHeight: 1.65 }}>{card.desc}</div>
              </div>

              {/* Tag */}
              <div style={{ alignSelf: "flex-start", padding: "0.22rem 0.6rem", borderRadius: "99px", background: `${card.glow}`, border: `1px solid ${card.border}`, fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: card.color }}>
                {card.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          INTELLIGENCE REPORT
      ═══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1040px", margin: "5rem auto 0", padding: "0 1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.5rem", padding: "2.5rem", transform: "translateZ(0)" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)" }}>Intelligence Report</span>
            </div>
            <Link href="/dashboard" style={{ fontSize: "0.75rem", color: "rgba(196,181,253,0.6)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", transition: "color 0.2s" }} className="hover:text-violet-400">
              View Dashboard →
            </Link>
          </div>

          {/* Metrics row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              { value: totalLecturesAcrossAll, label: "Lectures Finished", color: "#f1f5f9" },
              { value: questionsToday, label: "Questions Today", color: "#22d3ee" },
              { value: topicsPracticed, label: "Topics Practiced", color: "#a78bfa" },
            ].map((m) => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: m.color, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {m.value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.5)", fontWeight: 500, letterSpacing: "0.02em" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Weak zones */}
          {weakZones.length > 0 ? (
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Weak Zones Detected
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {weakZones.slice(0, 4).map(z => (
                  <div key={z.topicId} style={{ padding: "0.4rem 0.875rem", borderRadius: "99px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)", fontSize: "0.72rem", color: "#fca5a5" }}>
                    {z.topicId.replace(/-/g, " ")} · {Math.round(z.accuracy)}%
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.78rem", color: "#34d399" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              No weak zones detected — keep practicing!
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          GATE STRATEGY
      ═══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "5rem 1.5rem 6rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(34,211,238,0.65)", marginBottom: "0.75rem" }}>
            Strategy Guide
          </div>
          <div style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
            GATE EC Battle Plan
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "rgba(148,163,184,0.45)", lineHeight: 1.6 }}>
            Subject priority ordered by marks weightage — attack in this sequence.
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {STRATEGY_ITEMS.map((item, i) => (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", padding: "1.375rem 1.5rem", transition: "background 0.2s ease, border-color 0.2s ease" }}
              className="strategy-card"
            >
              <div style={{ fontSize: "1.75rem", fontWeight: 900, fontFamily: "var(--font-geist-mono)", color: item.color, opacity: 0.6, minWidth: "2.75rem", lineHeight: 1, textShadow: `0 0 24px ${item.color}40`, flexShrink: 0 }}>
                {item.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.925rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>{item.subject}</span>
                  <span style={{ padding: "0.22rem 0.65rem", borderRadius: "99px", background: `${item.color}16`, border: `1px solid ${item.color}28`, fontSize: "0.62rem", fontWeight: 700, color: item.color }}>
                    {item.weight}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>
                  {item.tip}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          style={{ marginTop: "2rem", padding: "1.5rem 1.75rem", borderRadius: "1rem", background: "linear-gradient(135deg, rgba(124,58,237,0.07), rgba(34,211,238,0.04))", border: "1px solid rgba(124,58,237,0.18)", display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}
        >
          <div style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>⚡</div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c4b5fd", marginBottom: "0.3rem" }}>Pro tip</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.65 }}>
              Spend the first 4 months on the top 3 subjects. Use the Practice Engine daily — even 10 questions/day compounds into 3,650 questions by exam day.
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
