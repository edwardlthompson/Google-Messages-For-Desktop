import { ABOUT_REPO_URL } from "./aboutCopy.ts";
import { feedbackCopy, type FeedbackKind } from "./feedbackCopy.ts";
import { buildReportMarkdown } from "./privacyReportBuild.ts";

export function escapeForPreview(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function feedbackMarkdown(
  kind: FeedbackKind,
  description: string,
  stack: string
): string {
  return buildReportMarkdown(kind, description, { stack }).trim();
}

export function canOpenGithub(description: string, stack: string): boolean {
  return Boolean(description.trim() || stack.trim());
}

export function githubDisabledReason(
  online: boolean,
  description: string,
  stack: string
): string | null {
  if (!canOpenGithub(description, stack)) {
    return feedbackCopy["feedback.github.need_text"];
  }
  if (!online) return feedbackCopy["feedback.github.offline"];
  return null;
}

export function composeGithubOpen(
  repoUrl: string,
  title: string,
  body: string,
  maxLen = 1800
): { url: string; copiedBody: boolean } {
  const base = repoUrl.replace(/\/$/, "");
  const full = `${base}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  if (full.length <= maxLen) return { url: full, copiedBody: false };
  return {
    url: `${base}/issues/new?title=${encodeURIComponent(title)}`,
    copiedBody: true,
  };
}

export function isAllowedGithubOpen(url: string, repoUrl = ABOUT_REPO_URL): boolean {
  try {
    const u = new URL(url);
    const r = new URL(repoUrl);
    return (
      u.protocol === "https:" &&
      u.hostname === "github.com" &&
      u.origin === r.origin &&
      u.pathname.startsWith(`${r.pathname.replace(/\/$/, "")}/issues/new`)
    );
  } catch {
    return false;
  }
}

export function issueTitle(kind: FeedbackKind): string {
  return kind === "bug"
    ? feedbackCopy["feedback.title.bug"]
    : feedbackCopy["feedback.title.feature"];
}
