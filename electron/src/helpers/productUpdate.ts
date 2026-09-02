export const MS_DAY = 86_400_000;

export type ProductKind = "exe" | "apk" | "dmg" | "appimage";

export interface NamedAsset {
  name: string;
  url: string;
}

export function shouldCheckDaily(
  lastCheckAt: number | null,
  now: number
): boolean {
  if (lastCheckAt == null || !Number.isFinite(lastCheckAt)) return true;
  return now - lastCheckAt >= MS_DAY;
}

export function compareVersions(current: string, latest: string): number {
  const parse = (v: string) =>
    v.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const a = parse(current);
  const b = parse(latest);
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function isNewerVersion(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}

export function productKindForPlatform(platform: string): ProductKind {
  if (platform === "darwin") return "dmg";
  if (platform === "linux") return "appimage";
  return "exe";
}

/**
 * Product installer versions from asset filenames — not git/template tags.
 * Desktop: Google.Messages-vX.Y.Z-win-x64.exe or Google-Messages-X.Y.Z-x64-setup.exe
 * Android: google-messages-X.Y.Z-foss.apk
 */
export function parseAssetVersion(
  name: string,
  kind: ProductKind
): string | null {
  const src = name.trim();
  if (!src || /\.blockmap$/i.test(src) || /\.portable\./i.test(src)) {
    return null;
  }
  const patterns: Record<ProductKind, RegExp[]> = {
    exe: [
      /Google[-.]Messages(?:-For-Desktop)?-v?(\d+\.\d+\.\d+)-x64-setup\.exe$/i,
      /Google[-.]Messages(?:-For-Desktop)?-v?(\d+\.\d+\.\d+)-win-[^.]+\.exe$/i,
      /GoogleMessagesSetup-(\d+\.\d+\.\d+)\.exe$/i,
    ],
    apk: [/google-messages-(\d+\.\d+\.\d+)-foss\.apk$/i],
    dmg: [/Google[-.]Messages(?:-For-Desktop)?-v?(\d+\.\d+\.\d+)-mac-[^.]+\.dmg$/i],
    appimage: [
      /Google[-.]Messages(?:-For-Desktop)?-v?(\d+\.\d+\.\d+)-linux-[^.]+\.AppImage$/i,
    ],
  };
  for (const re of patterns[kind]) {
    const match = re.exec(src);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function selectProductAsset(
  assets: NamedAsset[],
  kind: ProductKind
): { version: string; url: string; name: string } | null {
  let best: { version: string; url: string; name: string } | null = null;
  for (const asset of assets) {
    const version = parseAssetVersion(asset.name, kind);
    if (!version || !asset.url) continue;
    if (!best || isNewerVersion(best.version, version)) {
      best = { version, url: asset.url, name: asset.name };
    }
  }
  return best;
}

/** Git tag `v1.9.0` or `1.9.0` — not used when an installer filename matches. */
export function parseReleaseTag(tag: string | null | undefined): string | null {
  if (!tag?.trim()) return null;
  const match = /^v?(\d+\.\d+\.\d+)$/i.exec(tag.trim());
  return match?.[1] ?? null;
}

export function resolveLatestInstaller(
  assets: NamedAsset[],
  kind: ProductKind,
  tagName: string | null,
  htmlUrl: string
): { version: string; url: string; filename: string | null } | null {
  const asset = selectProductAsset(assets, kind);
  if (asset) {
    return { version: asset.version, url: asset.url, filename: asset.name };
  }
  const version = parseReleaseTag(tagName);
  if (version && htmlUrl) {
    return { version, url: htmlUrl, filename: null };
  }
  return null;
}

/** First launch records the version; later version changes get one donate note. */
export function shouldNudgeDonate(
  lastSeenVersion: string | null,
  currentVersion: string
): boolean {
  if (!currentVersion.trim()) return false;
  if (!lastSeenVersion?.trim()) return false;
  return lastSeenVersion.trim() !== currentVersion.trim();
}

export function shouldPromptUpdate(
  currentVersion: string,
  latestVersion: string | null,
  dismissedVersion: string | null
): boolean {
  if (!latestVersion) return false;
  if (!isNewerVersion(currentVersion, latestVersion)) return false;
  if (dismissedVersion && dismissedVersion === latestVersion) return false;
  return true;
}
