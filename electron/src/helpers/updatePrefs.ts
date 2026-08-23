import jetpack from "fs-jetpack";
import path from "path";

export const UPDATE_PREFS_FILENAME = "product-update.json";

export type UpdatePrefs = {
  lastCheckAt: number | null;
  lastSeenVersion: string | null;
  dismissedVersion: string | null;
};

const emptyPrefs = (): UpdatePrefs => ({
  lastCheckAt: null,
  lastSeenVersion: null,
  dismissedVersion: null,
});

function readNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function parseUpdatePrefs(raw: unknown): UpdatePrefs {
  if (!raw || typeof raw !== "object") return emptyPrefs();
  const obj = raw as Record<string, unknown>;
  return {
    lastCheckAt: readNumber(obj.lastCheckAt),
    lastSeenVersion: readString(obj.lastSeenVersion),
    dismissedVersion: readString(obj.dismissedVersion),
  };
}

export function updatePrefsPath(userDataDir: string): string {
  return path.resolve(userDataDir, UPDATE_PREFS_FILENAME);
}

export function createFilePrefsStore(userDataDir: string) {
  const file = updatePrefsPath(userDataDir);

  const write = (prefs: UpdatePrefs): void => {
    jetpack.write(file, prefs);
  };

  return {
    load(): UpdatePrefs {
      return parseUpdatePrefs(jetpack.read(file, "json"));
    },
    markUpdateChecked(now: number, dismissedVersion?: string | null): void {
      const prefs = this.load();
      prefs.lastCheckAt = now;
      if (dismissedVersion) prefs.dismissedVersion = dismissedVersion;
      write(prefs);
    },
    markVersionSeen(version: string): void {
      const prefs = this.load();
      prefs.lastSeenVersion = version;
      write(prefs);
    },
  };
}

export type UpdatePrefsStore = ReturnType<typeof createFilePrefsStore>;
