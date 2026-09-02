export const SPELLCHECK_LANGS = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
] as const;

const CODES = new Set<string>(SPELLCHECK_LANGS.map((l) => l.code));

export function parseSpellCheckLanguage(value: unknown): string {
  return typeof value === "string" && CODES.has(value) ? value : "en-US";
}
