/** Close-to-tray vs quit (no Electron imports). */

export const CLOSE_ACTIONS = ["ask", "tray", "quit"] as const;
export type CloseAction = (typeof CLOSE_ACTIONS)[number];

export function parseCloseAction(value: unknown): CloseAction {
  if (value === "tray" || value === "quit" || value === "ask") return value;
  return "ask";
}

/**
 * What to do on the main window close box.
 * File/tray Quit always quits. No tray → quit. Remembered tray/quit skip the dialog.
 */
export function resolveWindowClose(
  trayEnabled: boolean,
  preference: CloseAction,
  quitCommand: boolean,
  isMac = false
): "quit" | "tray" | "ask" {
  if (quitCommand) return "quit";
  if (isMac) return "tray";
  if (!trayEnabled) return "quit";
  return preference;
}
