/** When to show the local launch splash and when to reveal the main window. */

export const SPLASH_FALLBACK_MS = 15_000;
export const SPLASH_SHOW_FALLBACK_MS = 2_000;
export const SPLASH_WIDTH = 720;
export const SPLASH_HEIGHT = 405;
/** Night pavement under the photorealistic hero — not theme paper. */
export const SPLASH_BACKGROUND = "#070b12";
/** Keep the branded splash on screen long enough to actually see. */
export const SPLASH_MIN_VISIBLE_MS = 1_200;

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

export function shouldDismissSplash(opts: {
  mainReadyToShow: boolean;
  blockingOnboarding: boolean;
  timedOut: boolean;
}): boolean {
  if (opts.timedOut) return true;
  if (opts.blockingOnboarding) return true;
  return opts.mainReadyToShow;
}
