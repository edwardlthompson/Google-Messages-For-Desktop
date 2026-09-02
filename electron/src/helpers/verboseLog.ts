export const MAIN_LOG_BASENAME = "main.log";
export const MAIN_LOG_LINE_MAX = 2000;

export function formatMainLogLine(args: unknown[]): string {
  const parts = args.map((a) => {
    if (typeof a === "string") return a;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  });
  const line = parts.join(" ").replace(/\r?\n/g, " ");
  return line.slice(0, MAIN_LOG_LINE_MAX);
}
