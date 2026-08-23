import { app, BrowserWindow, dialog, nativeImage, shell } from "electron";
import path from "path";
import process from "process";
import { GITHUB_RELEASES_PAGE, VENMO_DONATE_URL } from "./donate";
import { RESOURCES_PATH } from "./constants";
import { fetchLatestGithubRelease } from "./githubRelease";
import { productKindForPlatform } from "./productUpdate";
import { decideForcedUpdateCheck, decideLaunchPrompt } from "./runAppUpdates";
import { createFilePrefsStore, type UpdatePrefsStore } from "./updatePrefs";

let prefsStore: UpdatePrefsStore | null = null;
let promptWindow: BrowserWindow | null = null;
let busy = false;

const icon = (): Electron.NativeImage | undefined => {
  const img = nativeImage.createFromPath(
    path.resolve(RESOURCES_PATH, "icons", "64x64.png")
  );
  return img.isEmpty() ? undefined : img;
};

export function initProductUpdatePrefs(userDataDir: string): void {
  prefsStore = createFilePrefsStore(userDataDir);
}

export function setProductUpdateWindow(win: BrowserWindow): void {
  promptWindow = win;
}

function store(): UpdatePrefsStore {
  if (!prefsStore) {
    prefsStore = createFilePrefsStore(app.getPath("userData"));
  }
  return prefsStore;
}

function showDialog(
  options: Electron.MessageBoxOptions
): Promise<Electron.MessageBoxReturnValue> {
  return promptWindow
    ? dialog.showMessageBox(promptWindow, options)
    : dialog.showMessageBox(options);
}

async function showDonateNudge(currentVersion: string): Promise<void> {
  const { response } = await showDialog({
    type: "info",
    buttons: ["Donate via Venmo", "Not now"],
    defaultId: 1,
    cancelId: 1,
    title: "Development is still going",
    message: "Development is still going",
    detail:
      "You just got a new build. If this app helps you, you can support ongoing work on Venmo. This is optional and will not appear again until the next update.",
    icon: icon(),
  });
  store().markVersionSeen(currentVersion);
  if (response === 0) {
    await shell.openExternal(VENMO_DONATE_URL);
  }
}

async function showUpdatePrompt(version: string, url: string): Promise<void> {
  const { response } = await showDialog({
    type: "info",
    buttons: ["Install", "Later"],
    defaultId: 0,
    cancelId: 1,
    title: "Update available",
    message: `Version ${version} is available.`,
    detail: `You're on ${app.getVersion()}. Install opens the download in your browser.`,
    icon: icon(),
  });
  store().markUpdateChecked(Date.now(), version);
  if (response === 0) {
    const target = url || GITHUB_RELEASES_PAGE;
    await shell.openExternal(target);
  }
}

export async function presentLaunchPrompts(): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    const version = app.getVersion();
    const prompt = await decideLaunchPrompt(
      version,
      store(),
      Date.now(),
      fetchLatestGithubRelease,
      productKindForPlatform(process.platform)
    );
    if (prompt?.kind === "donate") {
      await showDonateNudge(version);
    } else if (prompt?.kind === "update") {
      await showUpdatePrompt(prompt.version, prompt.url);
    }
  } finally {
    busy = false;
  }
}

export async function checkForProductUpdate(interactive: boolean): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    const version = app.getVersion();
    const result = await decideForcedUpdateCheck(
      version,
      store(),
      Date.now(),
      fetchLatestGithubRelease,
      productKindForPlatform(process.platform)
    );
    if (result.kind === "update") {
      await showUpdatePrompt(result.version, result.url);
    } else if (interactive && result.kind === "current") {
      await showDialog({
        type: "info",
        title: "No Update Found",
        message: "You're up to date.",
        detail: `Google Messages ${version} is the latest version.`,
        icon: icon(),
      });
    }
  } finally {
    busy = false;
  }
}

