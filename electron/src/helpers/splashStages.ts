/** Monotonic splash boot stages (pure logic). */

export const SPLASH_STAGES = [
  "app_loading",
  "app_ready",
  "messages_loading",
  "messages_ready",
] as const;

export type SplashStage = (typeof SPLASH_STAGES)[number];

const RANK: Record<SplashStage, number> = {
  app_loading: 0,
  app_ready: 1,
  messages_loading: 2,
  messages_ready: 3,
};

export function isSplashStage(value: unknown): value is SplashStage {
  return (
    typeof value === "string" &&
    (SPLASH_STAGES as readonly string[]).includes(value)
  );
}

export function splashStageRank(stage: SplashStage): number {
  return RANK[stage];
}

/** Advance only; never regress. Invalid input keeps current. */
export function nextSplashStage(
  current: SplashStage | null,
  incoming: unknown
): SplashStage {
  if (!isSplashStage(incoming)) {
    return current ?? "app_loading";
  }
  if (current == null) return incoming;
  return splashStageRank(incoming) >= splashStageRank(current)
    ? incoming
    : current;
}

/** Progress fill 0–1 for the stage bar (app half, then Google half). */
export function splashStageProgress(stage: SplashStage): number {
  switch (stage) {
    case "app_loading":
      return 0.15;
    case "app_ready":
      return 0.45;
    case "messages_loading":
      return 0.7;
    case "messages_ready":
      return 1;
    default:
      return 0;
  }
}
