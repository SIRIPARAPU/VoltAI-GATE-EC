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
      <div className="mb-6">
        <Link href={`/subject/${subject.id}/topic/${topic.id}`} className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Practice: {topic.title}</h1>
        <div className="mt-1 text-sm text-zinc-600">{subject.name}</div>
      </div>

      <PracticeClient subjectName={subject.name} topicTitle={topic.title} />
    </main>
  );
}

