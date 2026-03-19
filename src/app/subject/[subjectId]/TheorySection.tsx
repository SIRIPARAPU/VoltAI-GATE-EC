"use client";

import { useProgress } from "@/components/ProgressProvider";
import { buildLectureUrl } from "@/lib/youtube";

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
  const completedCount = videoIds.filter(vid => !!subjProgress[vid]).length;

  return (
    <section
      className="card-depth fade-up fade-up-delay-1"
      style={{ borderRadius: "1.25rem", padding: "1.25rem" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.01em",
            }}
          >
            Theory
          </h2>
          <p
            style={{
              marginTop: "0.25rem",
              fontSize: "0.72rem",
              color: "rgba(148,163,184,0.65)",
            }}
          >
            {completedCount}/{videoIds.length} lectures completed · Click number to watch, check to mark done.
          </p>
        </div>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
        >
          Open Playlist ↗
        </a>
      </div>

      {/* ── Video Grid (Table Format) ─────────────────── */}
      <div
        style={{
          marginTop: "1rem",
          borderRadius: "0.75rem",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          padding: "0.75rem",
        }}
      >
        {videoIds.length === 0 || !playlistId ? (
          <div style={{ padding: "0.5rem", fontSize: "0.85rem", color: "rgba(148,163,184,0.7)" }}>
            No lectures found for this playlist.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
              gap: "0.4rem",
            }}
          >
            {videoIds.map((videoId, i) => {
              const idx = i + 1;
              const href = buildLectureUrl({ playlistId, videoId, index1Based: idx });
              const isDone = !!subjProgress[videoId];

              return (
                <div
                  key={videoId}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  {/* Video number button */}
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={`Lecture ${idx}`}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-geist-mono), monospace",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                      color: isDone ? "rgba(255,255,255,0.4)" : "#e2e8f0",
                      background: isDone
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.04)",
                      border: isDone
                        ? "1px solid rgba(99,102,241,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isDone
                        ? "0 0 8px rgba(99,102,241,0.15)"
                        : "none",
                    }}
                    className="hover:bg-white/10 hover:border-white/20 hover:scale-105 active-compress"
                  >
                    {idx}
                  </a>

                  {/* Tiny checkbox below */}
                  <label
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={isDone ? "Unmark lecture" : "Mark as done"}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => markLecture(subjectId, videoId, e.target.checked)}
                      className="peer sr-only"
                    />
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "3px",
                        border: isDone
                          ? "1.5px solid rgba(99,102,241,0.6)"
                          : "1.5px solid rgba(255,255,255,0.15)",
                        background: isDone
                          ? "rgba(99,102,241,0.4)"
                          : "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isDone && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
