import fs from "fs";
import { app, BrowserWindow, dialog, shell } from "electron";
import jetpack from "fs-jetpack";
import { SETTINGS_FILE } from "./constants";
import { isPlainSettingsObject, pickKnownSettings } from "./settingsIo";
import { defaultSettings, setSettingsFlushEnabled, settings } from "./settings";
import { menuCopy } from "./menuCopy";
import { userCssPath } from "./userCssUi";
import { sessionPartitionForProfile } from "./sessionProfile";

export async function exportSettingsJson(win: BrowserWindow): Promise<void> {
  const picked = await dialog.showSaveDialog(win, {
    title: menuCopy["dialog.export_settings"],
    defaultPath: "google-messages-settings.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (picked.canceled || !picked.filePath) return;
  const src = SETTINGS_FILE();
  try {
    fs.copyFileSync(src, picked.filePath);
  } catch (err) {
    console.warn("export settings failed", err);
  }
}

export async function importSettingsJson(win: BrowserWindow): Promise<void> {
  const picked = await dialog.showOpenDialog(win, {
    title: menuCopy["dialog.import_settings"],
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  const file = picked.filePaths[0];
  if (picked.canceled || !file) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return;
  }
  if (!isPlainSettingsObject(parsed)) return;
  const patch = pickKnownSettings(parsed, defaultSettings as unknown as Record<string, unknown>);
  setSettingsFlushEnabled(false);
  for (const [key, value] of Object.entries(patch)) {
    const setting = settings[key as keyof typeof settings];
    if (setting) setting.next(value as never);
  }
  setSettingsFlushEnabled(true);
  const serializable: Record<string, unknown> = {};
  for (const [name, setting] of Object.entries(settings)) {
    serializable[name] = setting.value;
  }
  jetpack.write(SETTINGS_FILE(), serializable);
}

export async function resetAllSettings(win: BrowserWindow): Promise<void> {
  const result = await dialog.showMessageBox(win, {
    type: "warning",
    buttons: [menuCopy["dialog.cancel"], menuCopy["dialog.reset_relaunch"]],
    defaultId: 0,
    cancelId: 0,
    message: menuCopy["dialog.reset_settings"],
  });
  if (result.response !== 1) return;
  setSettingsFlushEnabled(false);
  for (const key of Object.keys(defaultSettings) as (keyof typeof defaultSettings)[]) {
    settings[key].next(defaultSettings[key] as never);
  }
  setSettingsFlushEnabled(true);
  jetpack.write(SETTINGS_FILE(), defaultSettings);
  app.relaunch();
  app.quit();
}

export async function signOutMessagesSession(win: BrowserWindow): Promise<void> {
  const result = await dialog.showMessageBox(win, {
    type: "warning",
    buttons: [menuCopy["dialog.cancel"], menuCopy["dialog.sign_out_btn"]],
    defaultId: 0,
    cancelId: 0,
    message: menuCopy["dialog.sign_out"],
    detail:
      `This clears ${sessionPartitionForProfile(settings.activeProfileId.value)} (cookies and site data for messages.google.com). App settings.json is kept.`,
  });
  if (result.response !== 1) return;
  try {
    await win.webContents.session.clearStorageData();
  } catch (err) {
    console.warn("clearStorageData failed", err);
  }
  if (!win.isDestroyed()) win.webContents.reload();
}

export function openUserCssFile(): void {
  const dest = userCssPath();
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(
      dest,
      "/* Local CSS only. Remote @import is ignored. */\n",
      "utf8"
    );
  }
  void shell.openPath(dest);
}
