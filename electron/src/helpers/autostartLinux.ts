import path from "path";

export const LINUX_AUTOSTART_BASENAME =
  "com.edwardlthompson.google-messages.desktop";

/** Extra names Electron may write; remove so we never double-launch. */
export const LINUX_AUTOSTART_STALE_NAMES = [
  "Google Messages.desktop",
  "google-messages-for-desktop.desktop",
];

export function linuxAutostartDir(home: string): string {
  return path.join(home, ".config", "autostart");
}

export function quoteDesktopExec(execPath: string): string {
  if (!/[\s"]/.test(execPath)) return execPath;
  return `"${execPath.replace(/"/g, '\\"')}"`;
}

export function linuxAutostartDesktopBody(opts: {
  name: string;
  execPath: string;
}): string {
  return [
    "[Desktop Entry]",
    "Type=Application",
    "Version=1.0",
    `Name=${opts.name}`,
    "Comment=Google Messages for Desktop",
    `Exec=${quoteDesktopExec(opts.execPath)}`,
    "Terminal=false",
    "X-GNOME-Autostart-enabled=true",
    "StartupNotify=false",
    "",
  ].join("\n");
}

export function linuxAutostartPaths(home: string): {
  target: string;
  stale: string[];
} {
  const dir = linuxAutostartDir(home);
  return {
    target: path.join(dir, LINUX_AUTOSTART_BASENAME),
    stale: LINUX_AUTOSTART_STALE_NAMES.map((n) => path.join(dir, n)),
  };
}
