"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

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

        {/* Nav links */}
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
        </div>
      </div>
    </header>
  );
}
