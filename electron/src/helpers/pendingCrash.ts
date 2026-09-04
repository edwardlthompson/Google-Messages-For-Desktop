import { sanitizeReportText } from "./privacyReport.ts";

export type PendingCrash = { message: string; stack: string };

const MAX_MSG = 500;
const MAX_STACK = 2000;

export const crashCopy = {
  "feedback.save_crashes": "Save crash details for me to review",
  "feedback.crash.title": "Saved crash details",
  "feedback.crash.review": "Review",
  "feedback.crash.dismiss": "Dismiss",
  "feedback.crash.detail":
    "One sanitized crash is stored on this device. Nothing was sent. GitHub will not open.",
};

function scrub(text: string): string {
  return sanitizeReportText(text).replace(/\s+/g, " ").trim();
}

/** Navigation aborts and debugger timeouts are expected during boot retries. */
export function shouldIgnoreCrash(raw: unknown): boolean {
  const msg =
    raw instanceof Error
      ? raw.message
      : typeof raw === "string"
        ? raw
        : String(raw ?? "");
  if (/ERR_ABORTED\s*\(-3\)/i.test(msg)) return true;
  if (/debugger timeout:/i.test(msg)) return true;
  return false;
}

export function sanitizeCrash(raw: unknown): PendingCrash | null {
  if (shouldIgnoreCrash(raw)) return null;
  if (raw == null) return null;
  if (typeof raw === "string" && !raw.trim()) return null;
  const err = raw instanceof Error ? raw : new Error(String(raw));
  const message = scrub(err.message || "Unknown error").slice(0, MAX_MSG);
  if (!message) return null;
  const stack = sanitizeReportText(err.stack || "", true).slice(0, MAX_STACK);
  return { message, stack };
}

export function parseStoredCrash(raw: unknown): PendingCrash | null {
  if (raw == null || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (typeof rec.message !== "string" || typeof rec.stack !== "string") return null;
  return {
    message: rec.message.slice(0, MAX_MSG),
    stack: rec.stack.slice(0, MAX_STACK),
  };
}

export function nextPendingCrash(
  optIn: boolean,
  incoming: PendingCrash | null,
  existing: PendingCrash | null
): PendingCrash | null {
  if (!optIn) return null;
  if (!incoming) return existing;
  return incoming;
}

export function captureCrash(
  busy: boolean,
  optIn: boolean,
  raw: unknown,
  existing: PendingCrash | null
): { busy: boolean; stored: PendingCrash | null } {
  if (busy) return { busy: true, stored: existing };
  if (!optIn) return { busy: false, stored: null };
  return {
    busy: true,
    stored: nextPendingCrash(optIn, sanitizeCrash(raw), existing),
  };
}
