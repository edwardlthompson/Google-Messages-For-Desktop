/** When to show the local launch splash and when to reveal the main window. */

export const SPLASH_FALLBACK_MS = 15_000;

export function shouldOpenSplash(startInTray: boolean): boolean {
  return startInTray !== true;
}

export function shouldRevealMain(opts: {
  blockingOnboarding: boolean;
  startInTray: boolean;
}): boolean {
  return !opts.blockingOnboarding && !opts.startInTray;
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
