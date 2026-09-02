/** Tab order for first-run defaults: real <button>s, no click-only divs. */
export const ONBOARDING_FOCUS_IDS = [
  "continue",
  "refresh",
  "open-settings",
  "open-search",
  "minimize",
  "skip",
] as const;

/** First-run buttons: 44px minimum for touch / tablet. */
export const TOUCH_TARGET_MIN_PX = 44;

export function onboardingKeyboardHint(): string {
  return "Keyboard: Tab to a button, then Enter. Esc is not used; use Skip for now to leave.";
}
