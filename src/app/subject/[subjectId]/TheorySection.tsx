"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider";

export function TheorySection({
  subjectId,
  playlistUrl,
  playlistId,
  videoIds,
}: {
  subjectId: string;
  playlistUrl: string;
  playlistId: string;
  videoIds: string[];
}) {
  const { progress, markLecture } = useProgress();
  const subjProgress = progress.lectures[subjectId] || {};
  const completedCount = videoIds.filter((vid) => !!subjProgress[vid]).length;

  const [activeVideoId, setActiveVideoId] = useState(videoIds[0] || "");
  const activeIndex = videoIds.indexOf(activeVideoId);
  const playlistRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item into view
  useEffect(() => {
    if (!playlistRef.current) return;
    const activeEl = playlistRef.current.querySelector(".active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeVideoId]);

  const goToNext = () => {
    if (activeIndex < videoIds.length - 1) setActiveVideoId(videoIds[activeIndex + 1]);
  };
  const goToPrev = () => {
    if (activeIndex > 0) setActiveVideoId(videoIds[activeIndex - 1]);
  };

  const embedSrc = playlistId && activeVideoId
    ? `https://www.youtube-nocookie.com/embed/${activeVideoId}?list=${playlistId}&index=${activeIndex + 1}&rel=0&modestbranding=1`
    : null;

  const isDone = !!subjProgress[activeVideoId];

  return (
    <section
      className="card-depth fade-up fade-up-delay-1"
      style={{ borderRadius: "1.375rem", padding: "1.75rem" }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}>
        <div>
          <div style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(124,58,237,0.8)",
            marginBottom: "0.3rem",
          }}>
            Theory Lectures
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.015em", margin: 0 }}>
            Video Learning
          </h2>
          <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.5 }}>
            {completedCount} of {videoIds.length} lectures completed
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Progress pill */}
          <div style={{
            padding: "0.35rem 0.875rem",
            borderRadius: "99px",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#c4b5fd",
            letterSpacing: "0.02em",
          }}>
            {videoIds.length > 0 ? Math.round((completedCount / videoIds.length) * 100) : 0}%
          </div>
          <a
            href={playlistUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: "0.4rem 1rem", fontSize: "0.78rem" }}
          >
            Open Playlist ↗
          </a>
        </div>
      </div>

      {/* Analog playlist note */}
      {subjectId === "analog" && videoIds.length > 0 && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          borderRadius: "0.75rem",
          background: "rgba(14,165,233,0.08)",
          border: "1px solid rgba(14,165,233,0.2)",
          fontSize: "0.78rem",
          color: "#7dd3fc",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem",
          lineHeight: 1.5,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "0.15rem" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>This playlist contains 105+ videos. Refer to the <a href="https://www.youtube.com/playlist?list=PLs5_Rtf2P2r674CTMNJ3odeHk9Wtb-WWl" target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "underline", textUnderlineOffset: "2px" }}>full YouTube playlist</a> to access all lectures.</span>
        </div>
      )}

      {videoIds.length === 0 || !playlistId ? (
        <div style={{ padding: "2rem", fontSize: "0.85rem", color: "rgba(148,163,184,0.5)", textAlign: "center" }}>
          No lectures found for this playlist.
        </div>
      ) : (
        <>
          {/* ── Two-column: Player + Playlist ──────────── */}
          <div
            style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) clamp(280px, 30%, 360px)", gap: "2rem" }}
            className="theory-layout"
          >
            {/* LEFT: Video Player */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Player */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideoId}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="video-player-wrapper"
                >
                  {embedSrc ? (
                    <iframe
                      src={embedSrc}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.4)", fontSize: "0.85rem" }}>
                      Select a lecture to play
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Player Controls Bar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "0.875rem 1.125rem",
                borderRadius: "0.875rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                {/* Lecture label */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)" }}>
                    Now Playing
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 600 }}>
                    Lecture <span style={{ color: "#c4b5fd" }}>{activeIndex + 1}</span>
                    <span style={{ color: "rgba(148,163,184,0.4)", fontWeight: 400 }}> / {videoIds.length}</span>
                  </div>
                </div>

                {/* Navigation + Mark done */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    onClick={goToPrev}
                    disabled={activeIndex === 0}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.875rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Prev
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={activeIndex === videoIds.length - 1}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.875rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    Next
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>

                  {/* Divider */}
                  <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.08)" }} />

                  {/* Mark done */}
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    cursor: "pointer",
                    padding: "0.4rem 0.875rem",
                    borderRadius: "0.75rem",
                    background: isDone ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                    border: isDone ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.15s ease",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: isDone ? "#a5b4fc" : "rgba(148,163,184,0.6)",
                  }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => markLecture(subjectId, activeVideoId, e.target.checked)}
                      className="sr-only"
                    />
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isDone ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
                      {isDone
                        ? <path d="M5 13l4 4L19 7"/>
                        : <circle cx="12" cy="12" r="10"/>}
                    </svg>
                    {isDone ? "Done" : "Mark done"}
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: Playlist Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.4)",
                paddingLeft: "0.25rem",
              }}>
                Playlist · {videoIds.length} lectures
              </div>
              <div ref={playlistRef} className="playlist-panel">
                {videoIds.map((videoId, i) => {
                  const isItemDone = !!subjProgress[videoId];
                  const isActive = videoId === activeVideoId;
                  return (
                    <div
                      key={videoId}
                      className={`playlist-item${isActive ? " active" : ""}`}
                      onClick={() => setActiveVideoId(videoId)}
                    >
                      {/* Number badge */}
                      <div style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        background: isActive ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                        border: isActive ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}>
                        {isActive ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#c4b5fd"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        ) : isItemDone ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                        ) : (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(148,163,184,0.35)", fontFamily: "var(--font-geist-mono)" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.78rem",
                          color: isActive ? "#f1f5f9" : isItemDone ? "rgba(148,163,184,0.75)" : "rgba(148,163,184,0.6)",
                          fontWeight: isActive ? 600 : 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.3,
                        }}>
                          Lecture {i + 1}
                        </div>
                        {isItemDone && !isActive && (
                          <div style={{ fontSize: "0.62rem", color: "rgba(52,211,153,0.6)", marginTop: "0.15rem", fontWeight: 500 }}>
                            Completed
                          </div>
                        )}
                      </div>

                      {/* Checkbox */}
                      <label
                        style={{ cursor: "pointer", flexShrink: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isItemDone}
                          onChange={(e) => markLecture(subjectId, videoId, e.target.checked)}
                          className="sr-only"
                        />
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: isItemDone ? "1.5px solid rgba(99,102,241,0.6)" : "1.5px solid rgba(255,255,255,0.12)",
                          background: isItemDone ? "rgba(99,102,241,0.35)" : "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}>
                          {isItemDone && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Progress bar ─────────────────────────── */}
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)" }}>
                Lecture Progress
              </span>
              <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-geist-mono)", color: "rgba(148,163,184,0.5)" }}>
                {completedCount} / {videoIds.length}
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${videoIds.length > 0 ? (completedCount / videoIds.length) * 100 : 0}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #22d3ee)", borderRadius: "99px" }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
