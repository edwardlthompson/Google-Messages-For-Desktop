export function proxyStatusLine(env: Record<string, string | undefined>): string {
  const v =
    env.HTTPS_PROXY ||
    env.https_proxy ||
    env.HTTP_PROXY ||
    env.http_proxy ||
    "";
  if (typeof v === "string" && v.trim()) {
    return `Proxy: ${v.trim().slice(0, 80)}`;
  }
  return "Proxy: system (Chromium default)";
}
