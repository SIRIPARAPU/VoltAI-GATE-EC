import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Innertube } from "youtubei.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const subjectsPath = path.join(repoRoot, "src", "data", "subjects.ts");
const outPath = path.join(repoRoot, "src", "data", "playlistVideoIds.json");

function extractPlaylistId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get("list") || "";
  } catch {
    return "";
  }
}

async function loadSubjects() {
  // Tiny, safe parser (no TS execution): extract playlist URLs and IDs from the config file.
  const raw = await fs.readFile(subjectsPath, "utf8");
  const subjectRegex = /id:\s*"([^"]+)"[\s\S]*?playlistUrl:\s*"([^"]+)"/g;
  const subjects = [];
  let m;
  while ((m = subjectRegex.exec(raw)) !== null) {
    const id = m[1];
    const playlistUrl = m[2];
    subjects.push({ id, playlistUrl, playlistId: extractPlaylistId(playlistUrl) });
  }
  return subjects.filter((s) => s.playlistId);
}

async function main() {
  const yt = await Innertube.create();
  const subjects = await loadSubjects();

  const result = {};

  for (const s of subjects) {
    const playlist = await yt.getPlaylist(s.playlistId);
    const ids = [];

    for await (const item of playlist.videos) {
      if (item?.id) ids.push(item.id);
    }

    // Try to continue if the library exposes continuation.
    while (playlist.videos?.has_continuation && typeof playlist.videos.getContinuation === "function") {
      const more = await playlist.videos.getContinuation();
      for await (const item of more) {
        if (item?.id) ids.push(item.id);
      }
      if (!more?.has_continuation) break;
    }

    result[s.id] = { playlistId: s.playlistId, videoIds: Array.from(new Set(ids)) };
    process.stdout.write(`Synced ${s.id}: ${result[s.id].videoIds.length} videos\n`);
  }

  await fs.writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  process.stdout.write(`\nWrote ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

