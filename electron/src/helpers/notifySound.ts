import path from "path";

export const NOTIFY_CHIME_REL = path.join("sounds", "notify-chime.wav");

/** Prefer asar.unpacked so OS players can open the WAV. */
export function resolvePlayableSoundPath(resourcesPath: string): string {
  const packed = path.join(resourcesPath, NOTIFY_CHIME_REL);
  const unpacked = packed.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
  return unpacked === packed ? packed : unpacked;
}

export function notificationSoundCommands(
  platform: string,
  file: string
): string[][] {
  if (platform === "darwin") {
    return [["afplay", file]];
  }
  if (platform === "win32") {
    const escaped = file.replace(/'/g, "''");
    return [
      [
        "powershell.exe",
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-Command",
        `(New-Object Media.SoundPlayer '${escaped}').PlaySync()`,
      ],
    ];
  }
  return [
    ["paplay", file],
    ["pw-play", file],
    ["canberra-gtk-play", "-f", file],
    ["aplay", "-q", file],
  ];
}
