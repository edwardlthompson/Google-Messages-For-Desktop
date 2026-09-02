/**
 * Shared first-run / onboarding probe constants.
 * Sample protocol opens during Stage A must not trigger compose.
 */
export const ONBOARDING_SAMPLE_NUMBER = "+15555550100";

let associationOnlyMode = false;

/** While true, protocol handlers skip compose (defaults picker only). */
export function setAssociationOnlyMode(enabled: boolean): void {
  associationOnlyMode = enabled;
}

export function isAssociationOnlyMode(): boolean {
  return associationOnlyMode;
}

/** Digits-only form of the onboarding sample (E.164 without punctuation). */
function sampleDigits(): string {
  return ONBOARDING_SAMPLE_NUMBER.replace(/[^\d]/g, "");
}

/**
 * True when the URL is an onboarding association probe for the sample number.
 * Uses phone normalization (ignores ?body= and other query junk).
 */
export function isOnboardingSampleUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (!/^(sms|tel|smsto|callto|im|mms):/i.test(url.trim())) return false;
  // Strip scheme + query/hash, keep leading + / digits only from the number part
  let rest = url.trim().replace(/^(sms|tel|smsto|callto|im|mms):/i, "");
  rest = rest.split("?")[0].split("#")[0];
  try {
    rest = decodeURIComponent(rest);
  } catch {
    /* keep raw */
  }
  const hasPlus = rest.trim().startsWith("+");
  const digits = rest.replace(/[^\d]/g, "");
  if (!digits) return false;
  const normalized = hasPlus ? `+${digits}` : digits;
  const sample = ONBOARDING_SAMPLE_NUMBER;
  return (
    normalized === sample ||
    digits === sampleDigits() ||
    normalized === `+${sampleDigits()}`
  );
}
