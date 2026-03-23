"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ── Subject layout data ─────────────────────────────────────
const LEFT = [
  { id: "maths",          name: "Engineering Mathematics", abbr: "EM", color: "#7c3aed" },
  { id: "analog",         name: "Analog Circuits",         abbr: "AC", color: "#f59e0b" },
  { id: "network-theory", name: "Network Theory",          abbr: "NT", color: "#8b5cf6" },
  { id: "communication",  name: "Communication Systems",   abbr: "CS", color: "#ec4899" },
];

const RIGHT = [
  { id: "digital",         name: "Digital Circuits",   abbr: "DC", color: "#10b981" },
  { id: "edc",             name: "Electronic Devices", abbr: "ED", color: "#06b6d4" },
  { id: "control-systems", name: "Control Systems",    abbr: "CT", color: "#f97316" },
  { id: "emft",            name: "Electromagnetics",   abbr: "EM", color: "#14b8a6" },
];

const BACK    = { id: "aptitude",        name: "General Aptitude",    abbr: "GA", color: "#a78bfa" };
const BOTTOM  = { id: "signals-systems", name: "Signals & Systems",  abbr: "SS", color: "#6366f1" };

// ── Subject tile ────────────────────────────────────────────
function Tile({
  id, name, abbr, color, delay = 0,
}: {
  id: string; name: string; abbr: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/subject/${id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <motion.div
          whileHover={{ y: -4, scale: 1.03 }}
          transition={{ duration: 0.2 }}
          style={{
            width: "190px",
            padding: "1.125rem 1.25rem",
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${color}25`,
            borderLeft: `3px solid ${color}60`,
            cursor: "pointer",
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
            boxShadow: `0 2px 16px rgba(0,0,0,0.3), 0 0 0 0px ${color}00`,
          }}
          className="world-tile"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${color}30`;
            e.currentTarget.style.borderColor = `${color}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 2px 16px rgba(0,0,0,0.3), 0 0 0 0px ${color}00`;
            e.currentTarget.style.borderColor = `${color}25`;
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Abbreviation badge */}
            <div style={{
              width: "36px", height: "36px", borderRadius: "0.625rem",
              background: `${color}15`, border: `1px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", fontWeight: 800, color, letterSpacing: "0.06em",
              flexShrink: 0,
            }}>
              {abbr}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                lineHeight: 1.3,
              }}>
                {name}
              </div>
              <div style={{ fontSize: "0.6rem", color: "rgba(148,163,184,0.4)", marginTop: "0.15rem", fontWeight: 500 }}>
                Click to enter
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Dashboard hub (center) ──────────────────────────────────
function DashboardHub() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/dashboard" style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.25 }}
          style={{
            width: "210px",
            padding: "2rem 1.5rem",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(34,211,238,0.06))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(124,58,237,0.25)",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(124,58,237,0.12), 0 4px 24px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 60px rgba(124,58,237,0.25), 0 8px 40px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,0.12), 0 4px 24px rgba(0,0,0,0.4)";
          }}
        >
          {/* Glow ring */}
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 1rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,211,238,0.15))",
            border: "1.5px solid rgba(124,58,237,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 0 12px rgba(34,211,238,0.1)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
          </div>

          <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(124,58,237,0.8)", marginBottom: "0.25rem" }}>
            Command Center
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Dashboard
          </div>
          <div style={{ fontSize: "0.62rem", color: "rgba(148,163,184,0.45)", marginTop: "0.5rem" }}>
            View progress & stats
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// WORLD PAGE
// ═══════════════════════════════════════════════════════════
export default function WorldPage() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      background: "linear-gradient(180deg, #050810 0%, #0a0e1a 40%, #0d1225 100%)",
    }}>
      {/* Multi-layer background — richer, less dark */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Radial glows — stronger */}
        <div style={{ position: "absolute", top: "-15%", left: "10%", width: "800px", height: "600px", background: "radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "5%", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(34,211,238,0.10) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)", borderRadius: "50%" }} />
        {/* Circuit grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}>
          <defs>
            <pattern id="w-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 H30 V10 H50 V40 H80" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
              <path d="M40 0 V25 H60 V55 H40 V80" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
              <circle cx="30" cy="10" r="2" fill="#7c3aed" opacity="0.5" />
              <circle cx="50" cy="40" r="2" fill="#22d3ee" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#w-circuit)" />
        </svg>
        {/* Star particles — more stars, varied sizes, subtle twinkle */}
        {Array.from({ length: 120 }).map((_, i) => {
          const size = 0.8 + (i % 4) * 0.6;
          const isPurple = i % 7 === 0;
          const isCyan = i % 11 === 0;
          const color = isPurple ? "#c4b5fd" : isCyan ? "#67e8f9" : "white";
          return (
            <div key={i} style={{
              position: "absolute",
              top: `${(i * 13 + 3) % 100}%`,
              left: `${(i * 29 + 7) % 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              background: color,
              opacity: 0.12 + (i % 6) * 0.06,
              boxShadow: size > 1.5 ? `0 0 ${size * 3}px ${color}40` : "none",
            }} />
          );
        })}
        {/* Subtle scan lines */}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)", pointerEvents: "none" }} />
      </div>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(124,58,237,0.75)" }}>
            VOLTAI
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            GATE Universe
          </div>
        </div>
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#c4b5fd", fontSize: "0.78rem", fontWeight: 600,
            textDecoration: "none", transition: "all 0.2s ease",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Exit World
        </Link>
      </div>

      {/* Main U-shaped layout */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "1.5rem 2rem",
        position: "relative",
        zIndex: 1,
        overflowY: "auto",
      }}
        className="world-layout"
      >
          {/* Top: Aptitude (behind center) */}
          <Tile id={BACK.id} name={BACK.name} abbr={BACK.abbr} color={BACK.color} delay={0.15} />

          {/* Middle: Left + Hub + Right */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
            className="world-middle"
          >
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {LEFT.map((s, i) => (
                <Tile key={s.id} {...s} delay={0.2 + i * 0.06} />
              ))}
            </div>

            {/* Center hub */}
            <DashboardHub />

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {RIGHT.map((s, i) => (
                <Tile key={s.id} {...s} delay={0.2 + i * 0.06} />
              ))}
            </div>
          </div>

          {/* Bottom: Signals & Systems */}
          <Tile id={BOTTOM.id} name={BOTTOM.name} abbr={BOTTOM.abbr} color={BOTTOM.color} delay={0.5} />
        </div>

      {/* Footer */}
      <div style={{
        padding: "0.875rem 2rem",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        textAlign: "center",
        fontSize: "0.62rem",
        color: "rgba(148,163,184,0.35)",
        fontWeight: 600,
        letterSpacing: "0.06em",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}>
        10 subjects · 1 command hub
      </div>
    </div>
  );
}
