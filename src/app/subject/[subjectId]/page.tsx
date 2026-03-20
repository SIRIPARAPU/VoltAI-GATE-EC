import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import playlistVideoIds from "@/data/playlistVideoIds.json";
import { extractPlaylistId } from "@/lib/youtube";
import { getTopics } from "@/data/syllabus";
import { TheorySection } from "./TheorySection";

// ── LOCKED: types + data fetching ─────────────────────────
type Props = { params: Promise<{ subjectId: string }> };

export default async function SubjectPage(props: Props) {
  const { subjectId } = await props.params;
  const subject = getSubject(subjectId);
  if (!subject) return notFound();

  const playlistId = extractPlaylistId(subject.playlistUrl);
  const record = (playlistVideoIds as Record<string, { playlistId: string; videoIds: string[] }>)[subject.id];
  const videoIds = record?.videoIds ?? [];

  const topics = getTopics(subject.id);
  // ─────────────────────────────────────────────────────────

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10" style={{ position: "relative" }}>

      {/* ── PCB Circuit Background (same as homepage) ──── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
          <defs>
            <pattern id="circuit-sub" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 H30 V10 H50 V40 H80" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
              <path d="M40 0 V25 H60 V55 H40 V80" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
              <circle cx="30" cy="10" r="2" fill="#7c3aed" opacity="0.5" />
              <circle cx="50" cy="40" r="2" fill="#22d3ee" opacity="0.5" />
              <circle cx="60" cy="55" r="1.5" fill="#a855f7" opacity="0.4" />
              <rect x="35" y="20" width="8" height="5" rx="1" fill="none" stroke="#6366f1" strokeWidth="0.3" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-sub)" />
        </svg>
      </div>

      {/* Content (above background) */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Page header — Back goes to /world */}
        <div className="mb-7 fade-up">
          <Link href="/world" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to World
          </Link>
          <h1
            className="mt-3 text-2xl font-bold tracking-tight fade-up fade-up-delay-1"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="text-gradient-neon">{subject.name}</span>
          </h1>
        </div>

        <div className="grid gap-6">
            <TheorySection
              subjectId={subject.id}
              playlistUrl={subject.playlistUrl}
              playlistId={playlistId || ""}
              videoIds={videoIds}
            />

            {/* ── Practice Section ────────────────────────── */}
            <section
              className="card-depth fade-up fade-up-delay-2"
              style={{ borderRadius: "1.375rem", padding: "1.75rem" }}
            >
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(34,211,238,0.7)", marginBottom: "0.3rem" }}>
                Practice
              </div>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.015em",
                  margin: 0,
                }}
              >
                Topic Practice
              </h2>
              <p
                style={{
                  marginTop: "0.3rem",
                  fontSize: "0.78rem",
                  color: "rgba(148,163,184,0.55)",
                  lineHeight: 1.5,
                }}
              >
                Choose a topic → get revision notes → start practice.
              </p>

              <div
                style={{
                  marginTop: "1rem",
                  maxHeight: 540,
                  overflowY: "auto",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {topics.map((t) => (
                    <li
                      key={t.id}
                      className="list-item-hover"
                      style={{
                        padding: "0.875rem 1.125rem",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* ── LOCKED: href ─ */}
                      <Link
                        href={`/subject/${subject.id}/topic/${t.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.85rem",
                          color: "#e2e8f0",
                          textDecoration: "none",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "rgba(6,182,212,0.6)",
                            flexShrink: 0,
                          }}
                        />
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
        </div>
      </div>
    </main>
  );
}
