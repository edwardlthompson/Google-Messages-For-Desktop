export type ChromeRolloutState = {
  colorfulDone: boolean;
  trayEnabled: boolean;
  monochromeIconEnabled: boolean;
};

export type ChromeRolloutResult = {
  trayEnabled: boolean;
  monochromeIconEnabled: boolean;
  colorfulDone: boolean;
};

/** One-time: color tray icon + tray visible. Skip if already rolled out. */
export function applyColorfulTrayRollout(
  state: ChromeRolloutState
): ChromeRolloutResult | null {
  if (state.colorfulDone) return null;
  return {
    trayEnabled: true,
    monochromeIconEnabled: false,
    colorfulDone: true,
  };
}
