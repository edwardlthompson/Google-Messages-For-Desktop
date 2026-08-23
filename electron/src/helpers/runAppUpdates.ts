import { GITHUB_RELEASES_PAGE } from "./donate.ts";
import { fetchLatestGithubRelease } from "./githubRelease.ts";
import type { GithubRelease } from "./githubRelease.ts";
import {
  selectProductAsset,
  shouldCheckDaily,
  shouldNudgeDonate,
  shouldPromptUpdate,
  type ProductKind,
} from "./productUpdate.ts";
import type { UpdatePrefsStore } from "./updatePrefs.ts";

export type LaunchPrompt =
  | { kind: "donate" }
  | { kind: "update"; version: string; url: string };

export type UpdateCheckResult =
  | { kind: "update"; version: string; url: string }
  | { kind: "current" }
  | { kind: "failed" };

export type FetchLatest = (
  currentVersion: string
) => Promise<GithubRelease | null>;

export async function decideLaunchPrompt(
  currentVersion: string,
  prefs: UpdatePrefsStore,
  now = Date.now(),
  fetchLatest: FetchLatest = fetchLatestGithubRelease,
  kind: ProductKind = "exe"
): Promise<LaunchPrompt | null> {
  const loaded = prefs.load();
  if (shouldNudgeDonate(loaded.lastSeenVersion, currentVersion)) {
    return { kind: "donate" };
  }
  prefs.markVersionSeen(currentVersion);
  if (!shouldCheckDaily(loaded.lastCheckAt, now)) return null;
  const release = await fetchLatest(currentVersion);
  prefs.markUpdateChecked(now);
  if (!release) return null;
  const asset = selectProductAsset(release.assets, kind);
  const latest = asset?.version ?? null;
  if (!shouldPromptUpdate(currentVersion, latest, loaded.dismissedVersion) || !latest) {
    return null;
  }
  return {
    kind: "update",
    version: latest,
    url: asset?.url || release.htmlUrl || GITHUB_RELEASES_PAGE,
  };
}

/** Manual check: skip donate and the 24h gate. Failed fetch stays silent. */
export async function decideForcedUpdateCheck(
  currentVersion: string,
  prefs: UpdatePrefsStore,
  now = Date.now(),
  fetchLatest: FetchLatest = fetchLatestGithubRelease,
  kind: ProductKind = "exe"
): Promise<UpdateCheckResult> {
  const loaded = prefs.load();
  const release = await fetchLatest(currentVersion);
  prefs.markUpdateChecked(now);
  if (!release) return { kind: "failed" };
  const asset = selectProductAsset(release.assets, kind);
  const latest = asset?.version ?? null;
  if (!shouldPromptUpdate(currentVersion, latest, loaded.dismissedVersion) || !latest) {
    return { kind: "current" };
  }
  return {
    kind: "update",
    version: latest,
    url: asset?.url || release.htmlUrl || GITHUB_RELEASES_PAGE,
  };
}
