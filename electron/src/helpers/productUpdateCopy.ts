/** Dialog copy for Check for Updates. Keep donate copy out of this file. */

import { formatCopy } from "./i18n.ts";
import { menuCopy } from "./menuCopy.ts";

export function updateAvailableMessage(latestVersion: string): string {
  return formatCopy(menuCopy["update.available.message"], { latest: latestVersion });
}

export function updateAvailableDetail(
  currentVersion: string,
  latestVersion: string,
  filename: string | null
): string {
  const fileLine = filename
    ? `Download: ${filename}`
    : "Download: the GitHub release page (no matching installer filename for this OS).";
  return [
    `You are running ${currentVersion}. The latest GitHub release is ${latestVersion}.`,
    fileLine,
    "Install opens that file in your browser. This app does not download or replace itself.",
    "When the download finishes, run the installer and restart Google Messages.",
  ].join("\n\n");
}

export function updateCurrentDetail(
  currentVersion: string,
  latestVersion: string
): string {
  return [
    `You are running Google Messages ${currentVersion}.`,
    `GitHub latest release is ${latestVersion}. No newer installer is available.`,
  ].join("\n\n");
}

export function updateFailedDetail(): string {
  return [
    "Could not reach GitHub Releases (network, timeout, or API error).",
    "Open the releases page in your browser to check manually, then download the installer for your OS and run it.",
  ].join("\n\n");
}
