import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import { getTopics } from "@/data/syllabus";
import { TopicClient } from "./topicClient";

type Props = { params: Promise<{ subjectId: string; topicId: string }> };

export default async function TopicPage(props: Props) {
  const { subjectId, topicId } = await props.params;
  const subject = getSubject(subjectId);
  if (!subject) return notFound();

  const topic = getTopics(subject.id).find((t) => t.id === topicId);
  if (!topic) return notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/subject/${subject.id}`} className="text-sm text-zinc-300 hover:text-zinc-100">
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{topic.title}</h1>
        <div className="mt-1 text-sm text-zinc-300">{subject.name}</div>
        <div className="mt-3">
          <Link
            href="/settings"
            className="text-sm text-zinc-200 underline underline-offset-4 hover:text-zinc-100"
          >
            Set AI key in Settings (required)
          </Link>
        </div>
      </div>

      <TopicClient subjectName={subject.name} topicTitle={topic.title} subjectId={subject.id} topicId={topic.id} />
    </main>
  );
}

