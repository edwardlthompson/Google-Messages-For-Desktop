import { app, BrowserWindow, dialog, nativeImage, shell } from "electron";
import path from "path";
import process from "process";
import { GITHUB_RELEASES_PAGE, VENMO_DONATE_URL } from "./donate";
import { RESOURCES_PATH } from "./constants";
import { fetchLatestGithubRelease } from "./githubRelease";
import { productKindForPlatform } from "./productUpdate";
import {
  updateAvailableDetail,
  updateAvailableMessage,
  updateCurrentDetail,
  updateFailedDetail,
} from "./productUpdateCopy";
import { decideForcedUpdateCheck, decideLaunchPrompt } from "./runAppUpdates";
import { settings } from "./settings";
import { policyDisablesUpdates } from "./managedPolicy";
import { getManagedPolicy } from "./managedPolicyUi";
import { menuCopy } from "./menuCopy";
import { dialogA11yTitle } from "./dialogA11y";
import { formatCopy } from "./i18n";
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
  const titled = {
    ...options,
    title: dialogA11yTitle(options.title, options.message),
  };
  return promptWindow
    ? dialog.showMessageBox(promptWindow, titled)
    : dialog.showMessageBox(titled);
}

async function showDonateNudge(currentVersion: string): Promise<void> {
  const { response } = await showDialog({
    type: "info",
    buttons: [menuCopy["menu.donate"], menuCopy["donate.not_now"]],
    defaultId: 1,
    cancelId: 1,
    title: menuCopy["donate.title"],
    message: menuCopy["donate.title"],
    detail:
      "You just got a new build. If this app helps you, you can support ongoing work on Venmo. This is optional and will not appear again until the next update.",
    icon: icon(),
  });
  store().markVersionSeen(currentVersion);
  if (response === 0) {
    await shell.openExternal(VENMO_DONATE_URL);
  }
}

async function showUpdatePrompt(
  currentVersion: string,
  latestVersion: string,
  url: string,
  filename: string | null
): Promise<void> {
  const { response } = await showDialog({
    type: "info",
    buttons: [menuCopy["update.install"], menuCopy["update.later"]],
    defaultId: 0,
    cancelId: 1,
    title: menuCopy["update.available.title"],
    message: updateAvailableMessage(latestVersion),
    detail: updateAvailableDetail(currentVersion, latestVersion, filename),
    icon: icon(),
  });
  if (response === 0) {
    store().markUpdateChecked(Date.now());
    await shell.openExternal(url || GITHUB_RELEASES_PAGE);
    return;
  }
  store().markUpdateChecked(Date.now(), latestVersion);
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
      productKindForPlatform(process.platform),
      settings.checkForUpdateOnLaunchEnabled.value &&
        !policyDisablesUpdates(getManagedPolicy())
    );
    if (prompt?.kind === "donate") {
      await showDonateNudge(version);
    } else if (prompt?.kind === "update") {
      await showUpdatePrompt(
        version,
        prompt.version,
        prompt.url,
        prompt.filename
      );
    }
  } finally {
    busy = false;
  }
}

export async function checkForProductUpdate(interactive: boolean): Promise<void> {
  if (busy) return;
  if (policyDisablesUpdates(getManagedPolicy())) return;
  busy = true;
  try {
    const version = app.getVersion();
    const result = await decideForcedUpdateCheck(
      version,
      store(),
      Date.now(),
      fetchLatestGithubRelease,
      productKindForPlatform(process.platform),
      true
    );
    if (result.kind === "update") {
      await showUpdatePrompt(
        version,
        result.version,
        result.url,
        result.filename
      );
    } else if (interactive && result.kind === "current") {
      await showDialog({
        type: "info",
        title: menuCopy["update.current.title"],
        message: formatCopy(menuCopy["update.current.message"], {
          latest: result.version,
        }),
        detail: updateCurrentDetail(version, result.version),
        icon: icon(),
      });
    } else if (interactive && result.kind === "failed") {
      const { response } = await showDialog({
        type: "error",
        buttons: [menuCopy["update.open_releases"], menuCopy["update.dismiss"]],
        defaultId: 0,
        cancelId: 1,
        title: menuCopy["update.failed.title"],
        message: menuCopy["update.failed.message"],
        detail: updateFailedDetail(),
        icon: icon(),
      });
      if (response === 0) {
        await shell.openExternal(GITHUB_RELEASES_PAGE);
      }
    }
  } finally {
    busy = false;
  }
}
