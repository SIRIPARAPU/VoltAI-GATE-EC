"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type TimerContextValue = {
  endAtMs: number | null;
  setMinutesFromNow: (minutes: number) => void;
  clear: () => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

const STORAGE_KEY = "gate_ai_global_timer_endAtMs";

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [endAtMs, setEndAtMs] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n > 0) {
      // Avoid React linter warning about synchronous setState in effects.
      setTimeout(() => setEndAtMs(n), 0);
    }
  }, []);

  const setMinutesFromNow = (minutes: number) => {
    const m = Math.max(1, Math.floor(minutes));
    const v = Date.now() + m * 60_000;
    localStorage.setItem(STORAGE_KEY, String(v));
    setEndAtMs(v);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEndAtMs(null);
  };

  const value = useMemo(() => ({ endAtMs, setMinutesFromNow, clear }), [endAtMs]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}

