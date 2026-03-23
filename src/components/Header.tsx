"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  // Hide header on /world for full immersion, and on / (homepage has its own hero)
  if (pathname === "/world" || pathname === "/") return null;

  return (
    <header className="header-glass sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight"
          style={{ textDecoration: "none" }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #d946ef, #22d3ee)",
              boxShadow: "0 0 8px rgba(109,40,217,0.8)",
            }}
          />
          <span
            className="text-gradient-neon text-sm font-bold tracking-tight"
            style={{ fontSize: "0.95rem" }}
          >
            VoltAI
          </span>
        </Link>

        {/* Nav links + theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{
              color: pathname === "/dashboard" ? "#c4b5fd" : "rgba(148,163,184,0.6)",
              textDecoration: "none",
              padding: "0.3rem 0.75rem",
              borderRadius: "0.5rem",
              background: pathname === "/dashboard" ? "rgba(124,58,237,0.12)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "rgba(148,163,184,0.6)", textDecoration: "none", padding: "0.3rem 0.75rem" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Settings
          </Link>
          <button
            onClick={toggle}
            aria-label="Toggle light/dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.3rem 0.5rem",
              borderRadius: "0.5rem",
              color: "rgba(148,163,184,0.6)",
              transition: "color 0.15s ease, background 0.15s ease",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c4b5fd";
              e.currentTarget.style.background = "rgba(124,58,237,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(148,163,184,0.6)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
