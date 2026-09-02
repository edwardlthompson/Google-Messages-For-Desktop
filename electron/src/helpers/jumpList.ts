/** Jump List / Dock / thumbar task args (no Electron). */

import { findProtocolArg } from "./protocolParse.ts";

export const NEW_MESSAGE_ARG = "--new-message";
export const MAX_RECENT_NUMBERS = 5;

export function isNewMessageArg(argv: unknown): boolean {
  if (!Array.isArray(argv)) return false;
  return argv.some((a) => String(a).trim() === NEW_MESSAGE_ARG);
}

export function protocolLaunchFromArgv(argv: string[]): string | null {
  return findProtocolArg(argv) || (isNewMessageArg(argv) ? "im:" : null);
}

export function parsePhoneList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const digits = item.replace(/[^\d+]/g, "");
    const n = digits.startsWith("+")
      ? `+${digits.replace(/[^\d]/g, "")}`
      : digits.replace(/[^\d]/g, "");
    if (n.replace("+", "").length < 7 || n.length > 16) continue;
    if (!out.includes(n)) out.push(n);
    if (out.length >= MAX_RECENT_NUMBERS) break;
  }
  return out;
}

export function rememberProtocolNumber(existing: unknown, number: string): string[] {
  return parsePhoneList([number, ...parsePhoneList(existing)]);
}

export function jumpListRecentItems(
  numbers: unknown,
  hideContent: boolean
): { title: string; args: string }[] {
  if (hideContent) return [];
  return parsePhoneList(numbers).map((n) => ({
    title: n,
    args: `sms:${n}`,
  }));
}
