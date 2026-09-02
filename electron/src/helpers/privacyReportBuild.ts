import { createHash } from "node:crypto";
import { sanitizeReportText } from "./privacyReport.ts";

function guessType(stack: string): string {
  const first = stack.split(/\n/)[0]?.trim() ?? "";
  const match = first.match(/^([A-Za-z][A-Za-z0-9_.$]+)/);
  return match?.[1] ?? "Error";
}

export function fingerprintCrash(
  stack: string | null | undefined,
  exceptionType?: string | null
): string {
  const cleaned = sanitizeReportText(stack, true);
  const frames = cleaned
    .split(/\n/)
    .map((ln) => ln.trim())
    .filter(Boolean)
    .slice(0, 12);
  const kind = (exceptionType || guessType(cleaned) || "Error").trim();
  const payload = kind + "\n" + frames.join("\n");
  return createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 12);
}

const KINDS = new Set(["crash", "bug", "feature"]);

export function buildReportMarkdown(
  kind: string,
  description: string | null | undefined,
  extras: {
    stack?: string | null;
    exceptionType?: string | null;
    fingerprint?: string | null;
    appVersion?: string | null;
    osFamily?: string | null;
  } = {}
): string {
  const reportKind = KINDS.has(kind) ? kind : "bug";
  const desc = sanitizeReportText(description);
  const stackS = sanitizeReportText(extras.stack, true);
  const parts = [
    "## What happened",
    desc || "(no description)",
    "",
    "## Kind",
    reportKind,
  ];
  if (extras.fingerprint) {
    parts.push("", "## Fingerprint", `\`${sanitizeReportText(extras.fingerprint)}\``);
  }
  if (extras.exceptionType) {
    parts.push("", "## Exception", sanitizeReportText(extras.exceptionType));
  }
  if (extras.appVersion) {
    parts.push("", "## App version", sanitizeReportText(extras.appVersion));
  }
  if (extras.osFamily) {
    parts.push("", "## OS family", sanitizeReportText(extras.osFamily));
  }
  if (stackS) parts.push("", "## Stack", "```", stackS, "```");
  return parts.join("\n").trim() + "\n";
}
