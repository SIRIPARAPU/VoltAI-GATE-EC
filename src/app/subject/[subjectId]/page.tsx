import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import playlistVideoIds from "@/data/playlistVideoIds.json";
import { buildLectureUrl, extractPlaylistId } from "@/lib/youtube";
import { getTopics } from "@/data/syllabus";

type Props = { params: Promise<{ subjectId: string }> };

export default async function SubjectPage(props: Props) {
  const { subjectId } = await props.params;
  const subject = getSubject(subjectId);
  if (!subject) return notFound();

  const playlistId = extractPlaylistId(subject.playlistUrl);
  const record = (playlistVideoIds as Record<string, { playlistId: string; videoIds: string[] }>)[subject.id];
  const videoIds = record?.videoIds ?? [];

  const topics = getTopics(subject.id);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-300 hover:text-zinc-100">
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{subject.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Theory</h2>
            <a
              href={subject.playlistUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#6D28D9] px-3 py-1.5 text-sm text-white shadow-[0_0_30px_rgba(109,40,217,0.35)] hover:bg-[#5B21B6]"
            >
              Open Full Playlist
            </a>
          </div>
          <p className="mt-1 text-sm text-zinc-300">
            Lecture links are generated as:{" "}
            <span className="font-mono text-zinc-100">watch?v=VIDEO_ID&list=PLAYLIST_ID&index=X</span>
          </p>

          <div className="mt-4 max-h-[540px] overflow-auto rounded-xl border border-white/10 bg-black/10">
            {videoIds.length === 0 || !playlistId ? (
              <div className="p-4 text-sm text-zinc-300">No lectures found for this playlist.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {videoIds.map((videoId, i) => {
                  const idx = i + 1;
                  const href = buildLectureUrl({ playlistId, videoId, index1Based: idx });
                  return (
                    <li key={videoId} className="p-3 hover:bg-white/5">
                      <a href={href} target="_blank" rel="noreferrer" className="text-sm text-zinc-100">
                        Lecture {idx}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Practice</h2>
          <p className="mt-1 text-sm text-zinc-300">
            Choose a topic (strictly from syllabus) → get revision notes → start practice.
          </p>

          <div className="mt-4 max-h-[540px] overflow-auto rounded-xl border border-white/10 bg-black/10">
            <ul className="divide-y divide-white/10">
              {topics.map((t) => (
                <li key={t.id} className="p-3 hover:bg-white/5">
                  <Link href={`/subject/${subject.id}/topic/${t.id}`} className="text-sm text-zinc-100">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        </div>

        <aside className="lg:col-span-1 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="text-sm font-medium text-zinc-100">Study Snapshot</div>
            <div className="mt-2 space-y-2 text-sm text-zinc-300">
              <div className="flex items-center justify-between gap-3">
                <span>Theory lectures</span>
                <span className="font-mono text-zinc-100">{videoIds.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Topics</span>
                <span className="font-mono text-zinc-100">{topics.length}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-xs leading-5">
                Practice never tracks completion. It stays topic-only for correctness.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

