"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTimer } from "@/components/TimerProvider";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function Header() {
  const { endAtMs, setMinutesFromNow, clear } = useTimer();
  const [now, setNow] = useState(() => Date.now());
  const [minutes, setMinutes] = useState("30");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => (endAtMs ? endAtMs - now : null), [endAtMs, now]);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0f1a]/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-100">
          GATE AI Command Center v2
        </Link>
        <div className="flex items-center gap-3 text-sm text-zinc-200">
          <div className="hidden sm:block text-zinc-300/80">Global timer</div>
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-zinc-100">
            {remaining == null ? "--:--:--" : fmt(remaining)}
          </div>
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-zinc-100"
            inputMode="numeric"
          />
          <button
            onClick={() => setMinutesFromNow(Number(minutes))}
            className="rounded-md bg-[#6D28D9] px-3 py-1.5 text-white shadow-[0_0_24px_rgba(109,40,217,0.35)] hover:bg-[#5B21B6]"
          >
            Start
          </button>
          <button
            onClick={clear}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </div>
    </header>
  );
}

