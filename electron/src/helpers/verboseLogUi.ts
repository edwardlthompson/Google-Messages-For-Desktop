import fs from "fs";
import path from "path";
import { app, shell } from "electron";
import { settings } from "./settings";
import { formatMainLogLine, MAIN_LOG_BASENAME } from "./verboseLog";

export function mainLogPath(): string {
  return path.join(app.getPath("userData"), MAIN_LOG_BASENAME);
}

function appendMainLog(level: string, args: unknown[]): void {
  try {
    fs.appendFileSync(
      mainLogPath(),
      `${new Date().toISOString()} [${level}] ${formatMainLogLine(args)}\n`
    );
  } catch {
    /* disk full or missing userData */
  }
}

function wrapConsoleMethod(
  method: "log" | "warn" | "error",
  level: string
): void {
  const orig = console[method].bind(console);
  console[method] = (...args: unknown[]) => {
    orig(...args);
    appendMainLog(level, args);
  };
}

export function bindVerboseMainLog(): void {
  if (!settings.verboseMainLogEnabled.value) return;
  wrapConsoleMethod("log", "log");
  wrapConsoleMethod("warn", "warn");
  wrapConsoleMethod("error", "error");
}

export function openMainLogFile(): void {
  const dest = mainLogPath();
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(
      dest,
      "# Enable Settings → Write verbose main-process log, then restart.\n",
      "utf8"
    );
  }
  void shell.openPath(dest);
}
