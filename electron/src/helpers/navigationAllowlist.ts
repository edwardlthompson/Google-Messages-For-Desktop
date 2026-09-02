/** Main-frame navigation and openExternal allowlists (no Electron). */

const EXTRA_GOOGLE_HOSTS = [
  "accounts.google.com",
  "google.com",
  "www.google.com",
  "messages.google.com",
  "photos.google.com",
  "voice.google.com",
  "support.google.com",
] as const;

function hostAllowed(host: string): boolean {
  const h = host.toLowerCase();
  return EXTRA_GOOGLE_HOSTS.some((ok) => h === ok || h.endsWith(`.${ok}`));
}

export function allowMainFrameNavigate(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "about:") {
      return parsed.pathname === "blank" || parsed.href === "about:blank";
    }
    if (parsed.protocol !== "https:") return false;
    return hostAllowed(parsed.hostname);
  } catch {
    return false;
  }
}

export function allowOpenExternalUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "mailto:") return true;
    if (parsed.protocol !== "https:") return false;
    return hostAllowed(parsed.hostname);
  } catch {
    return false;
  }
}

export function allowContextLink(url: unknown): boolean {
  return allowOpenExternalUrl(url);
}
