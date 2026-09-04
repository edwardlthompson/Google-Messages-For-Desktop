/** When to show the local launch splash and when to reveal the main window. */

/** Dismiss splash if the Messages SPA never mounts (covers slow cold starts). */
export const SPLASH_FALLBACK_MS = 45_000;
export const SPLASH_SHOW_FALLBACK_MS = 2_000;
/** Cap wait for splash HTML/stage bar before creating the main window. */
export const SPLASH_CHROME_WAIT_MS = 1_500;
export const SPLASH_WIDTH = 720;
/** Hero + verbose stage bar under the image. */
export const SPLASH_HEIGHT = 520;
/** Night pavement under the photorealistic hero — not theme paper. */
export const SPLASH_BACKGROUND = "#070b12";
/** Minimum branded flash so warm loads do not flicker the splash off instantly. */
export const SPLASH_MIN_VISIBLE_MS = 800;
/** Poll for mw-app after first document load. */
export const SPLASH_SPA_POLL_MS = 500;

export function shouldOpenSplash(startInTray: boolean): boolean {
  return startInTray !== true;
}

export function shouldRevealMain(opts: {
  blockingOnboarding: boolean;
  startInTray: boolean;
}): boolean {
  return !opts.blockingOnboarding && !opts.startInTray;
}

/** Show the webview before loadURL so Messages JS is not background-throttled. */
export function shouldShowMainBeforeLoad(opts: {
  blockingOnboarding: boolean;
  startInTray: boolean;
}): boolean {
  return shouldRevealMain(opts);
}

/**
 * Splash dismiss gate. `mainReadyToShow` means the Messages SPA mounted
 * (`mw-app`), not Electron BrowserWindow `ready-to-show`.
 */
export function shouldDismissSplash(opts: {
  mainReadyToShow: boolean;
  blockingOnboarding: boolean;
  timedOut: boolean;
}): boolean {
  if (opts.timedOut) return true;
  if (opts.blockingOnboarding) return true;
  return opts.mainReadyToShow;
}

/** Delay after SPA ready so the splash stays up at least `minVisibleMs`. */
export function splashDismissDelayMs(opts: {
  shownAtMs: number;
  nowMs: number;
  minVisibleMs: number;
}): number {
  const shownAt = Number.isFinite(opts.shownAtMs) ? opts.shownAtMs : 0;
  const now = Number.isFinite(opts.nowMs) ? opts.nowMs : shownAt;
  const min =
    Number.isFinite(opts.minVisibleMs) && opts.minVisibleMs > 0
      ? opts.minVisibleMs
      : 0;
  return Math.max(0, min - (now - shownAt));
}
