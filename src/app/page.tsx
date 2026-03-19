"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SUBJECTS } from "@/data/subjects";
import { useProgress } from "@/components/ProgressProvider";
import React, { useRef, useState, useEffect } from "react";
import playlistVideoIds from "@/data/playlistVideoIds.json";

// ── 3D Tilt Card Component ─────────────────────────────────
function TiltCard({
  children,
  className,
  style,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
  const highlightX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20%", "120%"]);
  const highlightY = useTransform(mouseYSpring, [-0.5, 0.5], ["-20%", "120%"]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX / rect.width - rect.left / rect.width - 0.5);
    y.set(e.clientY / rect.height - rect.top / rect.height - 0.5);
  };
  const handleMouseLeave = () => { setIsHovered(false); x.set(0); y.set(0); };

  return (
    <motion.a
      href={href} ref={ref}
      className={`relative overflow-hidden active-compress group block ${className}`}
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 rounded-inherit opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 50%)`, left: highlightX, top: highlightY, width: "200%", height: "200%", transform: "translate(-50%, -50%)" }}
      />
      {children}
    </motion.a>
  );
}

// ── Doomsday Countdown Timer ───────────────────────────────
function DoomsdayTimer() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // TARGET: December 29, 2026 (UTC) — approximate GATE exam date
  const target = new Date("2026-12-29T00:00:00+05:30").getTime();
  const diff = target - now;
  const isPast = diff <= 0;

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));

  const isWarning = days < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <div style={{
        fontSize: "0.65rem",
        fontWeight: 800,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: isWarning || isPast ? "#f87171" : "rgba(148,163,184,0.6)",
      }}>
        {isPast ? "EXAM APPROACHING" : isWarning ? "⚠ EXAM APPROACHING" : "GATE EC 2027"}
      </div>

      <div style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      }}>
        {[
          { value: days, label: "Days" },
          { value: hours, label: "Hours" },
          { value: minutes, label: "Min" },
        ].map((unit) => (
          <div key={unit.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                fontFamily: "var(--font-geist-mono)",
                color: isWarning || isPast ? "#f87171" : "#e2e8f0",
                textShadow: isWarning || isPast
                  ? "0 0 20px rgba(248,113,113,0.5)"
                  : "0 0 15px rgba(124,58,237,0.3)",
                lineHeight: 1,
                animation: isWarning || isPast ? "neonPulse 2s ease-in-out infinite" : "none",
              }}
            >
              {String(unit.value).padStart(2, "0")}
            </div>
            <div style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(148,163,184,0.5)",
              marginTop: "0.25rem",
            }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Feature Card ───────────────────────────────────────────
function FeatureCard({ title, description, icon, delay }: {
  title: string; description: string; icon: React.ReactNode; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        cursor: "default",
        transition: "box-shadow 0.3s ease",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
      className="hover:shadow-[0_4px_30px_rgba(124,58,237,0.15)]"
    >
      <div style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "0.75rem",
        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,211,238,0.1))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.7)", marginTop: "0.4rem", lineHeight: 1.5 }}>{description}</div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const { progress, getSubjectProgress, getTopicAccuracy } = useProgress();

  const totalLecturesAcrossAll = Object.values(progress.lectures).reduce(
    (acc, subjObj) => acc + Object.keys(subjObj).filter(k => subjObj[k]).length, 0
  );
  const todayStr = new Date().toISOString().split("T")[0];
  const questionsToday = progress.weeklyActivity[todayStr] || 0;
  const weakZones = Object.entries(progress.topics)
    .map(([topicId, stats]) => {
      const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0;
      return { topicId, accuracy, attempts: stats.attempts };
    })
    .filter(z => z.attempts >= 5 && z.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  const bentoSpans = [
    "lg:col-span-6 lg:row-span-2", "lg:col-span-6 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1", "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-2", "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1", "lg:col-span-4 lg:row-span-1",
    "lg:col-span-8 lg:row-span-1", "lg:col-span-4 lg:row-span-1",
  ];
  const accentColors = [
    { from: "rgba(109,40,217,0.25)", to: "rgba(6,182,212,0.15)" },
    { from: "rgba(6,182,212,0.22)", to: "rgba(99,102,241,0.15)" },
    { from: "rgba(236,72,153,0.22)", to: "rgba(109,40,217,0.12)" },
    { from: "rgba(16,185,129,0.20)", to: "rgba(6,182,212,0.12)" },
    { from: "rgba(245,158,11,0.18)", to: "rgba(236,72,153,0.12)" },
    { from: "rgba(99,102,241,0.25)", to: "rgba(6,182,212,0.10)" },
    { from: "rgba(20,184,166,0.22)", to: "rgba(99,102,241,0.12)" },
    { from: "rgba(168,85,247,0.22)", to: "rgba(6,182,212,0.12)" },
    { from: "rgba(59,130,246,0.22)", to: "rgba(168,85,247,0.12)" },
    { from: "rgba(34,211,238,0.20)", to: "rgba(109,40,217,0.15)" },
  ];
  const getTotalVids = (subjId: string) => {
    const record = (playlistVideoIds as Record<string, { videoIds: string[] }>)[subjId];
    return record?.videoIds?.length || 0;
  };

  return (
    <main className="min-h-screen" style={{ scrollBehavior: "smooth" }}>

      {/* ═══════════════════════════════════════════════════════
          IMMERSIVE HERO — Full viewport
      ═══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2rem",
        }}
      >
        {/* Circuit / PCB animated background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {/* Gradient mesh base */}
          <div
            className="gate-bg-animate"
            style={{
              position: "absolute",
              inset: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)",
            }}
          />

          {/* Circuit traces SVG overlay */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.08,
            }}
          >
            <defs>
              <pattern id="circuit" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 40 H30 V10 H50 V40 H80" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
                <path d="M40 0 V25 H60 V55 H40 V80" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
                <circle cx="30" cy="10" r="2" fill="#7c3aed" opacity="0.5" />
                <circle cx="50" cy="40" r="2" fill="#22d3ee" opacity="0.5" />
                <circle cx="60" cy="55" r="1.5" fill="#a855f7" opacity="0.4" />
                <rect x="35" y="20" width="8" height="5" rx="1" fill="none" stroke="#6366f1" strokeWidth="0.3" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>

          {/* Glowing orbs */}
          <div style={{ position: "absolute", top: "20%", left: "15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", animation: "float 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)", animation: "float 6s ease-in-out infinite alternate" }} />

          {/* Scan line effect */}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)", pointerEvents: "none" }} />
        </div>

        {/* Hero Content */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "600px" }}>

          {/* VoltAI Logo Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(3.5rem, 12vw, 7rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              background: "linear-gradient(135deg, #7c3aed 0%, #818cf8 30%, #22d3ee 70%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(124,58,237,0.3))",
            }}
          >
            VoltAI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              marginTop: "1rem",
              fontSize: "1.1rem",
              color: "rgba(203,213,225,0.7)",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            Enter the AI-powered GATE EC world
          </motion.p>

          {/* DO IT button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: "2.5rem" }}
          >
            <Link
              href="/world"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 3rem",
                fontSize: "1.1rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "white",
                background: "linear-gradient(135deg, #7C3AED, #22d3ee)",
                borderRadius: "99px",
                border: "none",
                textDecoration: "none",
                boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(34,211,238,0.15), inset 0 2px 0 rgba(255,255,255,0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                animation: "neonPulse 3s ease-in-out infinite",
              }}
              className="active-compress hover:scale-105 hover:shadow-[0_0_50px_rgba(124,58,237,0.6)]"
            >
              Do It
            </Link>
          </motion.div>

          {/* Doomsday Timer */}
          <div style={{ marginTop: "3rem" }}>
            <DoomsdayTimer />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)", textTransform: "uppercase" }}>Scroll</div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "4rem 1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(124,58,237,0.7)" }}>FEATURES</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", marginTop: "0.5rem", letterSpacing: "-0.02em" }}>Everything you need to crack GATE EC</div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <FeatureCard
            title="AI Mentor"
            description="Context-aware GATE tutor that understands your current topic and provides step-by-step solutions."
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
            delay={0.1}
          />
          <FeatureCard
            title="Practice Engine"
            description="30 GATE-level questions per session, strict topic adherence, real-time accuracy tracking."
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
            delay={0.2}
          />
          <FeatureCard
            title="Progress Tracking"
            description="Lecture completion, weak zone detection, weekly activity heatmap — all synced locally."
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            delay={0.3}
          />
          <FeatureCard
            title="3D Chip World"
            description="Walk through a futuristic PCB environment and physically explore each subject zone."
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
            delay={0.4}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INTELLIGENCE REPORT (Dashboard)
      ═══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1.25rem",
            padding: "2rem",
          }}
        >
          <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)", marginBottom: "1.25rem" }}>Intelligence Report</div>

          <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f1f5f9" }}>{totalLecturesAcrossAll}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)" }}>Lectures Finished</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#22d3ee" }}>{questionsToday}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)" }}>Questions Today</div>
            </div>
          </div>

          {weakZones.length > 0 ? (
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Weak Zones Detected
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {weakZones.slice(0, 3).map(z => (
                  <div key={z.topicId} style={{ padding: "0.4rem 0.75rem", borderRadius: "99px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", fontSize: "0.7rem", color: "#fca5a5" }}>
                    {z.topicId.replace(/-/g, " ")} · {Math.round(z.accuracy)}%
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#34d399" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              No weak zones detected. Keep practicing!
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SUBJECTS BENTO GRID
      ═══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "1.5rem" }}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>Curriculum Modules</div>
        </motion.div>

        <div className="grid grid-cols-12 gap-4 auto-rows-[140px]">
          {SUBJECTS.map((s, idx) => {
            const accent = accentColors[idx % accentColors.length];
            const totalVids = getTotalVids(s.id);
            const { completed, percent } = getSubjectProgress(s.id, totalVids);
            return (
              <TiltCard
                key={s.id}
                href={`/subject/${s.id}`}
                className={`bento-card ${bentoSpans[idx] ?? "lg:col-span-4 lg:row-span-1"}`}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTopColor: "rgba(255,255,255,0.12)",
                  borderRadius: "1.5rem",
                  padding: "1.5rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ transform: "translateZ(30px)" }} className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em", lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                      {s.name}
                    </div>
                    <div aria-hidden style={{ width: "8px", height: "8px", borderRadius: "50%", background: `linear-gradient(135deg, ${accent.from.replace('0.25', '0.8')}, ${accent.to.replace('0.15', '0.8')})`, boxShadow: `0 0 12px ${accent.from.replace('0.25', '0.5')}`, flexShrink: 0 }} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Progress</span>
                      <span className="text-[0.65rem] font-mono font-bold text-slate-400">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent.from.replace('0.25', '0.6')}, ${accent.to.replace('0.15', '1')})`, boxShadow: `0 0 8px ${accent.to.replace('0.15', '0.5')}` }} />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 80% 80%, ${accent.from} 0%, transparent 60%)`, mixBlendMode: "screen", transform: "translateZ(0px)" }} />
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Bottom Settings Link */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 4rem", textAlign: "center" }}>
        <Link
          href="/settings"
          style={{
            fontSize: "0.8rem",
            color: "rgba(148,163,184,0.5)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "color 0.2s",
          }}
          className="hover:text-violet-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          AI Settings
        </Link>
      </section>
    </main>
  );
}
