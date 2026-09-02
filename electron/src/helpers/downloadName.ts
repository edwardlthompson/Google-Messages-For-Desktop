/** Safe download filenames (no Electron). */

const BAD = /[\\/:*?"<>|\u0000-\u001f]/g;

export function safeDownloadName(name: unknown): string {
  const raw = typeof name === "string" ? name.trim() : "";
  const cleaned = raw.replace(BAD, "_").replace(/^\.+$/, "download");
  const base = cleaned.slice(0, 180) || "download";
  return base;
}
