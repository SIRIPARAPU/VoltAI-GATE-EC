import Link from "next/link";
import { SUBJECTS } from "@/data/subjects";

export default function Home() {
  const bentoSpans = [
    "lg:col-span-6 lg:row-span-2",
    "lg:col-span-6 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-2",
    "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1",
    "lg:col-span-8 lg:row-span-1",
    "lg:col-span-4 lg:row-span-1",
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 gate-bg-animate bg-gradient-to-r from-fuchsia-500/15 via-cyan-400/10 to-indigo-500/15" />
        <div className="relative">
          <div className="text-sm text-zinc-300">Personal study platform for GATE EC 2027</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              GATE AI Command Center v2
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">
            Pick a subject. Theory opens the exact YouTube lecture links. Practice stays strictly topic-focused.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/settings"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Settings (AI key)
            </Link>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              Global countdown: same timer everywhere
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="text-sm text-zinc-300">Subjects</div>
        <div className="mt-3 grid grid-cols-12 gap-3 auto-rows-[120px]">
          {SUBJECTS.map((s, idx) => (
            <Link
              key={s.id}
              href={`/subject/${s.id}`}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(109,40,217,0.22)] ${bentoSpans[idx] ?? "lg:col-span-4 lg:row-span-1"} `}
            >
              <div className="relative z-10">
                <div className="text-base font-medium text-zinc-100">{s.name}</div>
                <div className="mt-2 text-xs text-zinc-300">Theory + Practice</div>
              </div>
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-500/25 via-cyan-400/10 to-indigo-500/25 blur-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
