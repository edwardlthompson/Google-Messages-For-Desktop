import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
  captureCrash,
  crashCopy,
  parseStoredCrash,
  type PendingCrash,
} from "./pendingCrash";
import { settings } from "./settings";

const FILE = "pending-crash.json";
let busy = false;
let hooked = false;
let lastOptIn = false;

export function pendingCrashPath(userData: string): string {
  return path.join(userData, FILE);
}

function readStored(userData: string): PendingCrash | null {
  try {
    return parseStoredCrash(
      JSON.parse(fs.readFileSync(pendingCrashPath(userData), "utf8"))
    );
  } catch {
    return null;
  }
}

function writeStored(userData: string, crash: PendingCrash | null): void {
  const dest = pendingCrashPath(userData);
  try {
    if (!crash) {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      return;
    }
    fs.writeFileSync(
      dest,
      JSON.stringify({ message: crash.message, stack: crash.stack }),
      "utf8"
    );
  } catch {
    /* drop on write failure */
  }
}

function handle(raw: unknown): void {
  try {
    const userData = app.getPath("userData");
    const result = captureCrash(
      busy,
      settings.saveCrashDetailsEnabled.value,
      raw,
      readStored(userData)
    );
    busy = result.busy;
    writeStored(userData, result.stored);
  } catch {
    /* handler errors must not re-enter */
  } finally {
    busy = false;
  }
}

export function initCrashCapture(): void {
  if (hooked) return;
  hooked = true;
  lastOptIn = settings.saveCrashDetailsEnabled.value;
  process.on("uncaughtException", handle);
  process.on("unhandledRejection", handle);
  settings.saveCrashDetailsEnabled.subscribe((on: boolean) => {
    if (lastOptIn && !on) {
      try {
        writeStored(app.getPath("userData"), null);
      } catch {
        /* userData unavailable before ready */
      }
    }
    lastOptIn = on;
  });
}

export async function presentPendingCrashIfAny(): Promise<void> {
  const userData = app.getPath("userData");
  if (!settings.saveCrashDetailsEnabled.value) {
    writeStored(userData, null);
    return;
  }
  const crash = readStored(userData);
  if (!crash) return;
  const { response } = await dialog.showMessageBox({
    type: "warning",
    title: crashCopy["feedback.crash.title"],
    message: crashCopy["feedback.crash.title"],
    detail: `${crashCopy["feedback.crash.detail"]}\n\n${crash.message}`,
    buttons: [
      crashCopy["feedback.crash.review"],
      crashCopy["feedback.crash.dismiss"],
    ],
    defaultId: 1,
    cancelId: 1,
    noLink: true,
  });
  if (response === 1) writeStored(userData, null);
}
