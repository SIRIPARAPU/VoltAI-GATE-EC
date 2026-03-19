import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import { getTopics } from "@/data/syllabus";
import { PracticeClient } from "./practiceClient";

type Props = { params: Promise<{ subjectId: string; topicId: string }> };

export default async function PracticePage(props: Props) {
  const { subjectId, topicId } = await props.params;
  const subject = getSubject(subjectId);
  if (!subject) return notFound();
  const topic = getTopics(subject.id).find((t) => t.id === topicId);
  if (!topic) return notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-7 fade-up">
        {/* ── LOCKED: href ─ */}
        <Link href={`/subject/${subject.id}/topic/${topic.id}`} className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Topic
        </Link>
        <h1
          className="mt-3 text-2xl font-bold tracking-tight fade-up fade-up-delay-1"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span className="text-gradient-neon">{topic.title}</span> Practice
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
      </div>

      <div className="fade-up fade-up-delay-3">
        <PracticeClient subjectName={subject.name} topicTitle={topic.title} topicId={topic.id} />
      </div>
    </main>
  );
}

