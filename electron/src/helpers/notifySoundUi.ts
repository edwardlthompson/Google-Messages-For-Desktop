import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { RESOURCES_PATH } from "./constants";
import {
  NOTIFY_CHIME_REL,
  notificationSoundCommands,
  resolvePlayableSoundPath,
} from "./notifySound";

function existingSoundPath(): string | null {
  const preferred = resolvePlayableSoundPath(RESOURCES_PATH);
  if (fs.existsSync(preferred)) return preferred;
  const packed = path.join(RESOURCES_PATH, NOTIFY_CHIME_REL);
  return fs.existsSync(packed) ? packed : null;
}

function canSpawn(bin: string): boolean {
  if (process.platform === "win32") return true;
  const r = spawnSync("/bin/sh", ["-c", `command -v ${bin}`], {
    encoding: "utf8",
  });
  return r.status === 0;
}

/** Play the bundled Pixel-style chime. OS toast stays silent when this runs. */
export function playBundledNotifyChime(): boolean {
  const file = existingSoundPath();
  if (!file) {
    console.warn("Notification chime missing", RESOURCES_PATH);
    return false;
  }
  for (const args of notificationSoundCommands(process.platform, file)) {
    const bin = args[0];
    if (!bin || !canSpawn(bin)) continue;
    try {
      const child = spawn(bin, args.slice(1), {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
      return true;
    } catch {
      /* try next player */
    }
  }
  return false;
}
