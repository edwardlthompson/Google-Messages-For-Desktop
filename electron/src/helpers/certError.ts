/** TLS failures always deny; never call the Electron trust callback with true. */

export function neverTrustCertificate(): false {
  return false;
}

export function hostnameFromUrl(url: unknown): string {
  if (typeof url !== "string" || !url.trim()) return "";
  try {
    return new URL(url).hostname.slice(0, 253);
  } catch {
    return "";
  }
}

export function certInterstitialQuery(
  url: unknown,
  error: unknown
): Record<string, string> {
  const err =
    typeof error === "string" && error.trim()
      ? error.trim().slice(0, 200)
      : "certificate error";
  return { host: hostnameFromUrl(url), error: err };
}

export function isCertificateFailure(
  errorCode: unknown,
  errorDescription?: unknown
): boolean {
  if (
    typeof errorDescription === "string" &&
    /ERR_CERT|CERT_COMMON_NAME|CERT_AUTHORITY|CERT_DATE|CERT_INVALID/i.test(
      errorDescription
    )
  ) {
    return true;
  }
  if (typeof errorCode !== "number" || !Number.isInteger(errorCode)) return false;
  return errorCode <= -200 && errorCode >= -220;
}
