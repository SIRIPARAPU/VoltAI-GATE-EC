import { z } from "zod";

const YouTubeUrl = z.string().url();

export function extractPlaylistId(url: string): string {
  const parsed = YouTubeUrl.safeParse(url);
  if (!parsed.success) return "";

  try {
    const u = new URL(url);
    return u.searchParams.get("list") ?? "";
  } catch {
    return "";
  }
}

export function buildLectureUrl(opts: {
  playlistId: string;
  videoId: string;
  index1Based: number;
}) {
  const playlistId = opts.playlistId.trim();
  const videoId = opts.videoId.trim();
  const index = Math.max(1, Math.floor(opts.index1Based));
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&list=${encodeURIComponent(
    playlistId,
  )}&index=${index}`;
}

