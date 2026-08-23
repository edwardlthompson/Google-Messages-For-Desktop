/** Pure display-mode helpers (no Electron imports). */

export const PREFERRED_REFRESH_CHANNEL = "gmfd-preferred-refresh";
export const GET_PREFERRED_REFRESH_CHANNEL = "gmfd-get-preferred-refresh";

export type DisplayModeLike = {
  width: number;
  height: number;
  refreshRate: number;
};

export type DisplayLike = {
  size?: { width?: number; height?: number };
  bounds?: { width?: number; height?: number };
  displayFrequency?: number;
  modes?: DisplayModeLike[];
  displayModes?: DisplayModeLike[];
};

function finitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function displaySize(display: DisplayLike): { width: number; height: number } {
  const width = display.size?.width ?? display.bounds?.width ?? 0;
  const height = display.size?.height ?? display.bounds?.height ?? 0;
  return {
    width: finitePositive(width) ? width : 0,
    height: finitePositive(height) ? height : 0,
  };
}

/**
 * Highest refresh-rate mode that matches width×height. Resolution-changing
 * modes (e.g. 720p@high-Hz) are ignored so the window stays at the current size.
 */
export function fastestSameResolutionMode(
  modes: readonly DisplayModeLike[] | null | undefined,
  width: number,
  height: number
): DisplayModeLike | null {
  if (!Array.isArray(modes) || modes.length === 0) {
    return null;
  }
  if (!finitePositive(width) || !finitePositive(height)) {
    return null;
  }

  let best: DisplayModeLike | null = null;
  for (const mode of modes) {
    if (mode == null) {
      continue;
    }
    if (!finitePositive(mode.width) || !finitePositive(mode.height)) {
      continue;
    }
    if (!finitePositive(mode.refreshRate)) {
      continue;
    }
    if (mode.width !== width || mode.height !== height) {
      continue;
    }
    if (best == null || mode.refreshRate > best.refreshRate) {
      best = mode;
    }
  }
  return best;
}

/** Accept compositor-sane Hz only (1–1000). */
export function clampRefreshHz(hz: unknown): number | null {
  if (!finitePositive(hz)) {
    return null;
  }
  const rounded = Math.round(hz);
  if (rounded < 1 || rounded > 1000) {
    return null;
  }
  return rounded;
}

export function modesFromDisplay(
  display: DisplayLike | null | undefined
): DisplayModeLike[] {
  if (display == null) {
    return [];
  }
  const { width, height } = displaySize(display);
  const extra = [
    ...(Array.isArray(display.modes) ? display.modes : []),
    ...(Array.isArray(display.displayModes) ? display.displayModes : []),
  ];
  const current =
    width > 0 && height > 0 && finitePositive(display.displayFrequency)
      ? [
          {
            width,
            height,
            refreshRate: display.displayFrequency,
          },
        ]
      : [];
  return [...current, ...extra];
}

/**
 * Refresh rate for the window: fastest same-resolution mode, else the
 * display's current frequency.
 */
export function preferredWindowRefreshHz(
  display: DisplayLike | null | undefined
): number | null {
  if (display == null) {
    return null;
  }
  const { width, height } = displaySize(display);
  const best = fastestSameResolutionMode(
    modesFromDisplay(display),
    width,
    height
  );
  return clampRefreshHz(best?.refreshRate ?? display.displayFrequency);
}
