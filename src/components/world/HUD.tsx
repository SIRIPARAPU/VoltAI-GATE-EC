"use client";

import { useState, useEffect } from "react";

export function HUD() {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Top-left title */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(124,58,237,0.8)",
          }}
        >
          VOLTAI
        </div>
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}
        >
          The Chip World
        </div>
      </div>

      {/* Crosshair */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "2px",
            height: "12px",
            background: "rgba(255,255,255,0.3)",
            position: "absolute",
          }}
        />
        <div
          style={{
            width: "12px",
            height: "2px",
            background: "rgba(255,255,255,0.3)",
            position: "absolute",
          }}
        />
      </div>

      {/* Controls hint */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "1rem",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "0.85rem",
              color: "#e2e8f0",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>Click</span> to look around &nbsp;·&nbsp;
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>WASD</span> to move &nbsp;·&nbsp;
            <span style={{ color: "#22d3ee", fontWeight: 700 }}>Walk to structures</span> to explore
          </div>
        </div>
      )}

      {/* Back button */}
      <a
        href="/"
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          pointerEvents: "auto",
          padding: "0.5rem 1rem",
          borderRadius: "99px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#c4b5fd",
          fontSize: "0.8rem",
          fontWeight: 600,
          textDecoration: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        ← Exit World
      </a>
    </div>
  );
}
