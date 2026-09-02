export function liveRegionAnnouncement(becameUnread: boolean): string | null {
  return becameUnread ? "New message" : null;
}

export function parseMutedToastTitles(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const t = item.trim().slice(0, 80);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= 20) break;
  }
  return out;
}
