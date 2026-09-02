export const RELEASE_REPO = "edwardlthompson/Google-Messages-For-Desktop";

export function isPlaceholderRepo(ownerRepo: string): boolean {
  const s = ownerRepo.trim().toLowerCase();
  return !s || s === "owner/repo" || s === "your-org/your-repo" || s.includes("example/");
}

export function crashIssueTitle(fingerprint: string, typeName: string): string {
  return `[crash] ${fingerprint} ${typeName}`.replace(/\s+/g, " ").trim();
}

export function shortFingerprint(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(12, "0").slice(-12);
}

export function shouldSearchGithub(
  lastAt: number,
  now: number,
  windowMs = 60_000
): boolean {
  return lastAt <= 0 || now - lastAt >= windowMs;
}

export type GithubSearchFetch = (
  url: string,
  init: { headers: Record<string, string>; signal?: AbortSignal }
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export async function searchDuplicateIssues(
  fetchImpl: GithubSearchFetch,
  ownerRepo: string,
  query: string,
  lastAt: number,
  now: number
): Promise<{ items: string[]; searchedAt: number }> {
  if (isPlaceholderRepo(ownerRepo) || !shouldSearchGithub(lastAt, now)) {
    return { items: [], searchedAt: lastAt };
  }
  try {
    const q = encodeURIComponent(`${query} repo:${ownerRepo} is:issue`);
    const res = await fetchImpl(
      `https://api.github.com/search/issues?q=${q}&per_page=5`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok || res.status === 403) return { items: [], searchedAt: now };
    const body = await res.json();
    const items = Array.isArray((body as { items?: unknown }).items)
      ? ((body as { items: { html_url?: string }[] }).items
          .map((it) => it.html_url)
          .filter((u): u is string => typeof u === "string" && u.startsWith("https://github.com/")))
      : [];
    return { items, searchedAt: now };
  } catch {
    return { items: [], searchedAt: now };
  }
}

export function composeGithubIssueUrl(
  ownerRepo: string,
  title: string,
  body: string,
  maxLen = 1800
): { url: string; copiedBody: boolean } {
  const base = `https://github.com/${ownerRepo.replace(/^\//, "")}`;
  const full = `${base}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  if (full.length <= maxLen) return { url: full, copiedBody: false };
  return {
    url: `${base}/issues/new?title=${encodeURIComponent(title)}`,
    copiedBody: true,
  };
}
