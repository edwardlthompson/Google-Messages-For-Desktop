/** Window shape used to restore the first instance (no Electron import). */
export interface FocusableMainWindow {
  isDestroyed(): boolean;
  isVisible(): boolean;
  isMinimized(): boolean;
  show(): void;
  restore(): void;
  focus(): void;
}

/** True when this process must exit because another instance owns the lock. */
export function shouldExitForSecondInstance(gotTheLock: boolean): boolean {
  return gotTheLock !== true;
}

/**
 * Bring the existing main window forward (tray / minimized / already visible).
 * Returns false when there is no window yet (protocol URL should stay pending).
 */
export function focusExistingWindow(
  win: FocusableMainWindow | null | undefined
): boolean {
  if (!win || win.isDestroyed()) return false;
  if (win.isMinimized()) win.restore();
  if (!win.isVisible()) win.show();
  win.focus();
  return true;
}
