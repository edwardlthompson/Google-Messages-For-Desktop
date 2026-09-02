/** Expected attachment types skip the extra confirm dialog. */

const EXPECTED =
  /^(image|video|audio|text)\//i;

const EXPECTED_EXACT = new Set([
  "application/pdf",
  "application/zip",
  "application/gzip",
  "application/json",
]);

export function isExpectedDownloadMime(mime: unknown): boolean {
  if (typeof mime !== "string" || !mime.trim()) return false;
  const t = mime.trim().toLowerCase();
  return EXPECTED.test(t) || EXPECTED_EXACT.has(t);
}
