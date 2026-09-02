import { GITHUB_RELEASES_PAGE } from "./donate.ts";
import { fetchLatestGithubRelease } from "./githubRelease.ts";
import type { GithubRelease } from "./githubRelease.ts";
import {
  resolveLatestInstaller,
  shouldCheckDaily,
  shouldNudgeDonate,
  shouldPromptUpdate,
  type ProductKind,
} from "./productUpdate.ts";
import type { UpdatePrefsStore } from "./updatePrefs.ts";

export type LaunchPrompt =
  | { kind: "donate" }
  | { kind: "update"; version: string; url: string; filename: string | null };

export type UpdateCheckResult =
  | { kind: "update"; version: string; url: string; filename: string | null }
  | { kind: "current"; version: string }
  | { kind: "failed" };

export type FetchLatest = (
  currentVersion: string
) => Promise<GithubRelease | null>;

function fromRelease(
  release: GithubRelease,
  kind: ProductKind
): { version: string; url: string; filename: string | null } | null {
  const resolved = resolveLatestInstaller(
    release.assets,
    kind,
    release.tagName,
    release.htmlUrl || GITHUB_RELEASES_PAGE
  );
  if (!resolved) return null;
  return {
    version: resolved.version,
    url: resolved.url || release.htmlUrl || GITHUB_RELEASES_PAGE,
    filename: resolved.filename,
  };
}

export async function decideLaunchPrompt(
  currentVersion: string,
  prefs: UpdatePrefsStore,
  now = Date.now(),
  fetchLatest: FetchLatest = fetchLatestGithubRelease,
  kind: ProductKind = "exe",
  checkOnLaunch = true
): Promise<LaunchPrompt | null> {
  const loaded = prefs.load();
  if (shouldNudgeDonate(loaded.lastSeenVersion, currentVersion)) {
    return { kind: "donate" };
  }
  prefs.markVersionSeen(currentVersion);
  if (!checkOnLaunch) return null;
  if (!shouldCheckDaily(loaded.lastCheckAt, now)) return null;
  const release = await fetchLatest(currentVersion);
  prefs.markUpdateChecked(now);
  if (!release) return null;
  const latest = fromRelease(release, kind);
  if (
    !latest ||
    !shouldPromptUpdate(currentVersion, latest.version, loaded.dismissedVersion)
  ) {
    return null;
  }
  return { kind: "update", ...latest };
}

/** Manual check: skip donate and the 24h gate. Menu path ignores Later. */
export async function decideForcedUpdateCheck(
  currentVersion: string,
  prefs: UpdatePrefsStore,
  now = Date.now(),
  fetchLatest: FetchLatest = fetchLatestGithubRelease,
  kind: ProductKind = "exe",
  ignoreDismissed = false
): Promise<UpdateCheckResult> {
  const release = await fetchLatest(currentVersion);
  prefs.markUpdateChecked(now);
  if (!release) return { kind: "failed" };
  const latest = fromRelease(release, kind);
  if (!latest) return { kind: "failed" };
  const dismissed = ignoreDismissed ? null : prefs.load().dismissedVersion;
  if (!shouldPromptUpdate(currentVersion, latest.version, dismissed)) {
    return { kind: "current", version: latest.version };
  }
  return { kind: "update", ...latest };
}
