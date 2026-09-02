export function rendererCrashShouldReload(reason: string): boolean {
  return reason === "crashed" || reason === "oom" || reason === "killed";
}

export const RENDERER_CRASH_MESSAGE =
  "The Messages page stopped. Reload to continue.";
