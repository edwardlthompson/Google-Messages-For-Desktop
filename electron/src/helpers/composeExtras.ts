/** Protocol compose extras (no Electron). Do not grow compose.ts. */

export const SNIPPET_MAX = 280;
export const SIGNATURE_MAX = 280;
export const PROTOCOL_BODY_MAX = 2000;

export function parseSnippet(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, SNIPPET_MAX);
}

export function parseSignature(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, SIGNATURE_MAX);
}

export function applyProtocolSignature(body: string, signature: unknown): string {
  const base = typeof body === "string" ? body : "";
  const sig = parseSignature(signature);
  if (!sig) return base.slice(0, PROTOCOL_BODY_MAX);
  const combined = base ? `${base}\n\n${sig}` : sig;
  return combined.slice(0, PROTOCOL_BODY_MAX);
}

export function shouldConfirmProtocolCompose(
  confirmEnabled: unknown,
  number: string
): boolean {
  return confirmEnabled === true && Boolean(number);
}
