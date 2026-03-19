import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import { getTopics } from "@/data/syllabus";
import { TopicClient } from "./topicClient";

// ── LOCKED: data fetching + routing ───────────────────────
type Props = { params: Promise<{ subjectId: string; topicId: string }> };

export default async function TopicPage(props: Props) {
  const { subjectId, topicId } = await props.params;
  const subject = getSubject(subjectId);
  if (!subject) return notFound();

  const topic = getTopics(subject.id).find((t) => t.id === topicId);
  if (!topic) return notFound();
  // ─────────────────────────────────────────────────────────

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      {/* Page header */}
      <div className="mb-7 fade-up">
        {/* ── LOCKED: href ─ */}
        <Link href={`/subject/${subject.id}`} className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {subject.name}
        </Link>

        <h1
          className="mt-3 text-2xl font-bold tracking-tight fade-up fade-up-delay-1"
          style={{ letterSpacing: "-0.02em", color: "#f1f5f9" }}
        >
          {topic.title}
        </h1>

        <div
          className="mt-1 fade-up fade-up-delay-2"
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(148,163,184,0.6)",
          }}
        >
          {subject.name}
        </div>

        {/* Settings link */}
        <div className="mt-3 fade-up fade-up-delay-3">
          {/* ── LOCKED: href ─ */}
          <Link
            href="/settings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.78rem",
              color: "rgba(196,181,253,0.8)",
              textDecoration: "none",
              padding: "0.3rem 0.75rem",
              borderRadius: "99px",
              background: "rgba(109,40,217,0.10)",
              border: "1px solid rgba(109,40,217,0.25)",
              transition: "all 0.2s ease",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Set AI key in Settings (required)
          </Link>
        </div>
      </div>

      {/* ── LOCKED: TopicClient component + all props ─ */}
      <div className="fade-up fade-up-delay-3">
        <TopicClient
          subjectName={subject.name}
          topicTitle={topic.title}
          subjectId={subject.id}
          topicId={topic.id}
        />
      </div>
    </main>
  );
}
