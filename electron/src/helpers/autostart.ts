import { app } from "electron";
import fs from "fs";
import os from "os";
import { IS_LINUX } from "./constants";
import { settings } from "./settings";
import {
  linuxAutostartDesktopBody,
  linuxAutostartDir,
  linuxAutostartPaths,
} from "./autostartLinux";

function unlinkQuiet(dest: string): void {
  try {
    fs.unlinkSync(dest);
  } catch {
    /* missing */
  }
}

function applyLinuxXdgAutostart(enabled: boolean): void {
  const home = os.homedir();
  const { target, stale } = linuxAutostartPaths(home);
  for (const extra of stale) unlinkQuiet(extra);
  if (!enabled) {
    unlinkQuiet(target);
    return;
  }
  fs.mkdirSync(linuxAutostartDir(home), { recursive: true });
  fs.writeFileSync(
    target,
    linuxAutostartDesktopBody({
      name: "Google Messages",
      execPath: app.getPath("exe"),
    }),
    "utf8"
  );
}

export function bindAutostart(): void {
  const apply = (): void => {
    const openAtLogin = settings.startWithOsEnabled.value;
    const openAsHidden = settings.startInTrayEnabled.value;
    if (IS_LINUX) {
      applyLinuxXdgAutostart(openAtLogin);
      return;
    }
    app.setLoginItemSettings({
      openAtLogin,
      openAsHidden,
    });
  };
  apply();
  settings.startWithOsEnabled.subscribe(apply);
  settings.startInTrayEnabled.subscribe(apply);
}
