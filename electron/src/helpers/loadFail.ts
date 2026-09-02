/** Chromium load-fail codes that should show Reload (no Electron). */

import { isCertificateFailure } from "./certError.ts";

export function shouldShowOfflineBanner(
  errorCode: unknown,
  isMainFrame: unknown,
  errorDescription?: unknown
): boolean {
  if (isMainFrame !== true) return false;
  if (typeof errorCode !== "number" || !Number.isInteger(errorCode)) {
    return false;
  }
  if (errorCode >= 0) return false;
  if (errorCode === -3) return false;
  if (isCertificateFailure(errorCode, errorDescription)) return false;
  return true;
}
