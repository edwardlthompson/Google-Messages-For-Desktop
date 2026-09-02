import { isExpectedDownloadMime } from "./downloadMime.ts";

export function shouldOpenDownloadedMedia(mime: string): boolean {
  if (!isExpectedDownloadMime(mime)) return false;
  return /^(image|video|audio)\//i.test(mime);
}

export function downloadProgressLabel(received: number, total: number): string {
  if (!Number.isFinite(received) || received < 0) return "Downloading…";
  if (!Number.isFinite(total) || total <= 0) return "Downloading…";
  const pct = Math.min(100, Math.round((received / total) * 100));
  return `Downloading ${pct}%`;
}
